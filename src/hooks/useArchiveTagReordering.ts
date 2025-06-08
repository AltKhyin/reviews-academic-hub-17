
// ABOUTME: Client-side backend tag reordering system with scoring algorithm and graceful fallback handling
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArchiveIssue, TagHierarchy } from '@/types/archive';

interface TagReorderingState {
  selectedTags: string[];
  tagHierarchy: TagHierarchy;
  isLoading: boolean;
  error: Error | null;
}

interface ScoredIssue extends ArchiveIssue {
  tagScore: number;
}

// Fetch active tag configuration from database
const fetchActiveTagConfiguration = async (): Promise<TagHierarchy> => {
  const { data, error } = await supabase
    .from('tag_configurations')
    .select('tag_data')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn('No active tag configuration found, using empty hierarchy:', error);
    return {};
  }

  // Properly handle the Json type from Supabase
  const tagData = data?.tag_data;
  
  // Type guard to ensure we have a valid TagHierarchy
  if (!tagData || typeof tagData !== 'object' || Array.isArray(tagData)) {
    console.warn('Invalid tag_data format, using empty hierarchy');
    return {};
  }

  // Additional validation to ensure all values are string arrays
  const validatedHierarchy: TagHierarchy = {};
  for (const [key, value] of Object.entries(tagData)) {
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      validatedHierarchy[key] = value as string[];
    } else {
      console.warn(`Invalid subtags for category "${key}", skipping`);
    }
  }

  return validatedHierarchy;
};

// Calculate relevance score for an issue based on selected tags
const calculateIssueTagScore = (issue: ArchiveIssue, selectedTags: string[]): number => {
  if (selectedTags.length === 0) return 0;

  let score = 0;
  
  // Handle null or invalid backend_tags gracefully
  let backendTags: TagHierarchy = {};
  
  if (issue.backend_tags) {
    try {
      if (typeof issue.backend_tags === 'string') {
        backendTags = JSON.parse(issue.backend_tags);
      } else if (typeof issue.backend_tags === 'object') {
        backendTags = issue.backend_tags as TagHierarchy;
      }
    } catch (error) {
      console.warn('Invalid backend_tags format for issue:', issue.id, error);
      return 0;
    }
  }

  // Score calculation: parent match = +2, subtag match = +1
  for (const selectedTag of selectedTags) {
    for (const [parentTag, subtags] of Object.entries(backendTags)) {
      // Parent tag exact match
      if (selectedTag === parentTag) {
        score += 2;
      }
      
      // Subtag match
      if (Array.isArray(subtags) && subtags.includes(selectedTag)) {
        score += 1;
      }
    }
  }

  return score;
};

// Get all parent categories from tag hierarchy
const getParentCategories = (tagHierarchy: TagHierarchy): string[] => {
  return Object.keys(tagHierarchy).sort();
};

// Get subtags for selected parent categories
const getSubtagsForSelectedParents = (tagHierarchy: TagHierarchy, selectedParents: string[]): string[] => {
  const subtags: string[] = [];
  
  selectedParents.forEach(parent => {
    const parentSubtags = tagHierarchy[parent] || [];
    subtags.push(...parentSubtags);
  });
  
  return [...new Set(subtags)].sort(); // Remove duplicates and sort
};

export const useArchiveTagReordering = (issues: ArchiveIssue[]) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch tag configuration
  const { data: tagHierarchy = {}, isLoading, error } = useQuery({
    queryKey: ['active-tag-configuration'],
    queryFn: fetchActiveTagConfiguration,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  // Memoized parent categories (always visible)
  const parentCategories = useMemo(() => 
    getParentCategories(tagHierarchy), 
    [tagHierarchy]
  );

  // Memoized selected parent categories
  const selectedParents = useMemo(() => 
    selectedTags.filter(tag => parentCategories.includes(tag)), 
    [selectedTags, parentCategories]
  );

  // Memoized subtags for selected parents (conditionally visible)
  const visibleSubtags = useMemo(() => 
    getSubtagsForSelectedParents(tagHierarchy, selectedParents), 
    [tagHierarchy, selectedParents]
  );

  // Memoized reordered issues based on tag scores
  const reorderedIssues = useMemo((): ScoredIssue[] => {
    if (selectedTags.length === 0) {
      // No tags selected: return original order with zero scores
      return issues.map(issue => ({ ...issue, tagScore: 0 }));
    }

    // Calculate scores and sort by relevance
    const scoredIssues = issues.map(issue => ({
      ...issue,
      tagScore: calculateIssueTagScore(issue, selectedTags)
    }));

    // Sort by score (descending), then by creation date (descending) for tie-breaking
    return scoredIssues.sort((a, b) => {
      if (b.tagScore !== a.tagScore) {
        return b.tagScore - a.tagScore;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [issues, selectedTags]);

  // Tag selection handlers
  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const isCurrentlySelected = prev.includes(tag);
      
      if (isCurrentlySelected) {
        // Deselecting a tag
        if (parentCategories.includes(tag)) {
          // If deselecting a parent, also remove all its subtags
          const parentSubtags = tagHierarchy[tag] || [];
          return prev.filter(selectedTag => 
            selectedTag !== tag && !parentSubtags.includes(selectedTag)
          );
        } else {
          // Just remove the subtag
          return prev.filter(selectedTag => selectedTag !== tag);
        }
      } else {
        // Selecting a new tag
        return [...prev, tag];
      }
    });
  }, [parentCategories, tagHierarchy]);

  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Determine tag visual states for UI
  const getTagState = useCallback((tag: string): 'selected' | 'highlighted' | 'unselected' => {
    if (selectedTags.includes(tag)) {
      return 'selected';
    }
    
    // Check if this is a subtag of a selected parent (highlighted state)
    if (!parentCategories.includes(tag)) {
      const isSubtagOfSelectedParent = selectedParents.some(parent => {
        const parentSubtags = tagHierarchy[parent] || [];
        return parentSubtags.includes(tag);
      });
      
      if (isSubtagOfSelectedParent) {
        return 'highlighted';
      }
    }
    
    return 'unselected';
  }, [selectedTags, parentCategories, selectedParents, tagHierarchy]);

  return {
    // Data
    reorderedIssues,
    tagHierarchy,
    selectedTags,
    
    // UI State
    parentCategories,
    visibleSubtags,
    hasActiveTagSelection: selectedTags.length > 0,
    
    // Loading States
    isLoading,
    error,
    
    // Actions
    handleTagSelect,
    clearAllTags,
    getTagState,
    
    // Statistics
    tagMatchCount: reorderedIssues.filter(issue => issue.tagScore > 0).length,
  };
};
