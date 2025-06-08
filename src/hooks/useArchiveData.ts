
// ABOUTME: Simplified archive data hook for backward compatibility - no tag filtering
import { useState, useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';

interface ArchiveFilters {
  searchQuery: string;
}

// Simple filtering without tags
const createSimpleFilter = (issues: any[], filters: ArchiveFilters) => {
  if (!issues?.length) return [];
  
  let filtered = issues;
  
  // Text search filtering only
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
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  return filtered;
};

export const useArchiveData = () => {
  const [filterState, setFilterState] = useState<ArchiveFilters>({
    searchQuery: '',
  });

  // Use the optimized hook
  const { data, isLoading, error } = useOptimizedArchiveData();

  // Memoized filtering for performance
  const filteredIssues = useMemo(() => 
    createSimpleFilter(data?.issues || [], filterState),
    [data?.issues, filterState]
  );

  // Simple setter function
  const setSearchQuery = useMemo(() => (query: string) => {
    setFilterState({ searchQuery: query });
  }, []);

  // Clear filters function
  const clearFilters = useMemo(() => () => {
    setFilterState({ searchQuery: '' });
  }, []);

  // Get filter statistics
  const getFilterStats = useMemo(() => () => ({
    totalIssues: data?.issues?.length || 0,
    filteredIssues: filteredIssues.length,
    activeFilters: {
      hasSearch: !!filterState.searchQuery,
    },
  }), [data?.issues?.length, filteredIssues.length, filterState]);

  return {
    issues: filteredIssues,
    filterState,
    isLoading,
    error,
    setSearchQuery,
    clearFilters,
    getFilterStats,
    // Additional metadata
    totalCount: data?.totalCount || 0,
    specialties: data?.specialties || [],
    years: data?.years || [],
  };
};
