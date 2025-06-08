
// ABOUTME: Optimized archive data hook with intelligent filtering and reduced database calls
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { ArchiveIssue } from '@/types/archive';

interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  contextualTags: string[];
}

export const useOptimizedArchiveData = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedTags: [],
    contextualTags: [],
  });

  // Fetch all archive data once with optimized fields
  const { data: allIssues, isLoading } = useQuery({
    queryKey: queryKeys.archiveData(),
    queryFn: async (): Promise<ArchiveIssue[]> => {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          id,
          title,
          search_title,
          description,
          search_description,
          cover_image_url,
          specialty,
          authors,
          year,
          design,
          score,
          population,
          published_at,
          created_at
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as ArchiveIssue[]) || [];
    },
    ...queryConfigs.static,
    staleTime: 20 * 60 * 1000, // 20 minutes since archive data doesn't change frequently
  });

  // Fetch tag configuration once
  const { data: tagConfig } = useQuery({
    queryKey: ['tag-config'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_tag_config');
      if (error) throw error;
      return data || {};
    },
    ...queryConfigs.static,
    staleTime: 60 * 60 * 1000, // 1 hour since tag config rarely changes
  });

  // Client-side filtering for better performance
  const filteredIssues = useMemo(() => {
    if (!allIssues) return [];

    let filtered = allIssues;

    // Apply search filter
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(issue => {
        const searchableText = [
          issue.title,
          issue.search_title,
          issue.description,
          issue.search_description,
          issue.authors,
          issue.specialty,
          issue.year,
          issue.design
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Apply tag filters
    if (filterState.selectedTags.length > 0) {
      filtered = filtered.filter(issue => {
        const issueSpecialties = issue.specialty?.toLowerCase().split(',').map(s => s.trim()) || [];
        return filterState.selectedTags.some(tag => 
          issueSpecialties.includes(tag.toLowerCase())
        );
      });
    }

    // Add tag match scoring for better sorting
    return filtered.map(issue => {
      const tagMatches = filterState.selectedTags.filter(tag => 
        issue.specialty?.toLowerCase().includes(tag.toLowerCase())
      ).length;
      
      return {
        ...issue,
        tagMatches
      };
    }).sort((a, b) => {
      // Sort by tag matches first, then by date
      if (a.tagMatches !== b.tagMatches) {
        return b.tagMatches - a.tagMatches;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [allIssues, filterState]);

  // Update contextual tags based on current selection
  const updateContextualTags = useMemo(() => {
    if (!allIssues || !filterState.selectedTags.length) {
      setFilterState(prev => ({ ...prev, contextualTags: [] }));
      return;
    }

    // Extract relevant tags from filtered results
    const relevantTags = new Set<string>();
    filteredIssues.forEach(issue => {
      if (issue.specialty) {
        issue.specialty.split(',').forEach(tag => {
          const cleanTag = tag.trim();
          if (cleanTag && !filterState.selectedTags.includes(cleanTag)) {
            relevantTags.add(cleanTag);
          }
        });
      }
    });

    const newContextualTags = Array.from(relevantTags).slice(0, 10); // Limit to 10
    setFilterState(prev => ({ ...prev, contextualTags: newContextualTags }));
  }, [filteredIssues, filterState.selectedTags]);

  // Optimized filter functions
  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  };

  const selectTag = (tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const clearFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedTags: [],
      contextualTags: [],
    });
  };

  return {
    issues: filteredIssues,
    allIssues: allIssues || [],
    tagConfig: tagConfig || {},
    filterState,
    isLoading,
    
    // Filter actions
    setSearchQuery,
    selectTag,
    clearFilters,
    
    // Stats
    totalIssues: allIssues?.length || 0,
    filteredCount: filteredIssues.length,
  };
};

