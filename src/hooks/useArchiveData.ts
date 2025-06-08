
// ABOUTME: Updated archive data hook to use optimized version with backward compatibility and proper interface
import { useState, useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';
import { getRecommendedCacheTime } from '@/utils/databaseOptimizations';

interface ArchiveFilters {
  searchQuery: string;
  selectedTags: string[];
  contextualTags: string[];
}

// Enhanced filtering with performance optimizations
const createOptimizedFilter = (issues: any[], filters: ArchiveFilters) => {
  if (!issues?.length) return [];
  
  let filtered = issues;
  
  // Optimized search filtering with early termination
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    const searchTerms = query.split(' ').filter(term => term.length > 1);
    
    filtered = filtered.filter(issue => {
      const searchableText = [
        issue.title,
        issue.description,
        issue.specialty,
        issue.authors
      ].filter(Boolean).join(' ').toLowerCase();
      
      // All search terms must match (AND logic)
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  // Optimized tag filtering with Set for O(1) lookup
  if (filters.selectedTags.length > 0) {
    const selectedTagsSet = new Set(filters.selectedTags);
    
    filtered = filtered.filter(issue => {
      if (!issue.backend_tags) return false;
      
      try {
        const tags = typeof issue.backend_tags === 'string' 
          ? JSON.parse(issue.backend_tags) 
          : issue.backend_tags;
        
        if (typeof tags === 'object' && tags !== null) {
          // Check if any selected tags match the issue's tags
          for (const tagList of Object.values(tags)) {
            if (Array.isArray(tagList)) {
              for (const tag of tagList) {
                if (typeof tag === 'string' && selectedTagsSet.has(tag)) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      } catch {
        return false;
      }
    });
  }
  
  return filtered;
};

export const useArchiveData = () => {
  const [filterState, setFilterState] = useState<ArchiveFilters>({
    searchQuery: '',
    selectedTags: [],
    contextualTags: [],
  });

  // Use the optimized hook with proper cache configuration
  const { data, isLoading, error } = useOptimizedArchiveData();

  // Memoized filtering for performance
  const filteredIssues = useMemo(() => 
    createOptimizedFilter(data?.issues || [], filterState),
    [data?.issues, filterState]
  );

  // Optimized setter functions
  const setSearchQuery = useMemo(() => (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const selectTag = useMemo(() => (tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  // Clear filters function
  const clearFilters = useMemo(() => () => {
    setFilterState({
      searchQuery: '',
      selectedTags: [],
      contextualTags: [],
    });
  }, []);

  // Get filter statistics
  const getFilterStats = useMemo(() => () => ({
    totalIssues: data?.issues?.length || 0,
    filteredIssues: filteredIssues.length,
    activeFilters: {
      hasSearch: !!filterState.searchQuery,
      tagCount: filterState.selectedTags.length,
      contextualTagCount: filterState.contextualTags.length,
    },
  }), [data?.issues?.length, filteredIssues.length, filterState]);

  return {
    issues: filteredIssues,
    tagConfig: data?.tagConfig || {},
    filterState,
    isLoading,
    error,
    selectTag,
    setSearchQuery,
    clearFilters,
    getFilterStats,
    // Additional metadata
    totalCount: data?.totalCount || 0,
    specialties: data?.specialties || [],
    years: data?.years || [],
  };
};
