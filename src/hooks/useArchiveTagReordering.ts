
// ABOUTME: Archive tag-based reordering system for enhanced content discovery
import { useState, useEffect, useMemo } from 'react';
import { Issue } from '@/types/issue';

interface TagState {
  selected: boolean;
  count: number;
}

interface ParentCategory {
  id: string;
  name: string;
  count: number;
  subtags: string[];
}

export const useArchiveTagReordering = (issues: Issue[]) => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Extract categories from issues (simplified approach)
  const parentCategories = useMemo((): ParentCategory[] => {
    const specialtyMap = new Map<string, number>();
    
    issues.forEach(issue => {
      if (issue.specialty) {
        specialtyMap.set(issue.specialty, (specialtyMap.get(issue.specialty) || 0) + 1);
      }
    });
    
    return Array.from(specialtyMap.entries()).map(([specialty, count]) => ({
      id: specialty,
      name: specialty,
      count,
      subtags: [], // Simplified - no subtags for now
    }));
  }, [issues]);

  // Visible subtags (empty for simplified approach)
  const visibleSubtags = useMemo(() => [], []);

  // Check if any tags are selected
  const hasActiveTagSelection = selectedTags.size > 0;

  // Reorder issues based on selected tags
  const reorderedIssues = useMemo(() => {
    if (!hasActiveTagSelection) {
      return issues;
    }
    
    // Filter issues by selected specialties
    return issues.filter(issue => 
      issue.specialty && selectedTags.has(issue.specialty)
    );
  }, [issues, selectedTags, hasActiveTagSelection]);

  // Handle tag selection
  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  // Clear all selected tags
  const clearAllTags = () => {
    setSelectedTags(new Set());
  };

  // Get tag state for a specific tag
  const getTagState = (tagId: string): TagState => {
    const category = parentCategories.find(cat => cat.id === tagId);
    return {
      selected: selectedTags.has(tagId),
      count: category?.count || 0,
    };
  };

  // Get count of issues matching selected tags
  const tagMatchCount = reorderedIssues.length;

  return {
    reorderedIssues,
    parentCategories,
    visibleSubtags,
    selectedTags,
    hasActiveTagSelection,
    isLoading,
    error,
    handleTagSelect,
    clearAllTags,
    getTagState,
    tagMatchCount,
  };
};
