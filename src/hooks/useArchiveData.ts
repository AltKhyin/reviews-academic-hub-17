
// ABOUTME: Updated archive data hook to use optimized version with backward compatibility and proper interface
import { useState, useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';

interface ArchiveFilters {
  searchQuery: string;
  selectedTags: string[];
  contextualTags: string[];
}

// Mock tag configuration for now - this would come from your tag system
const mockTagConfig = {
  categories: [],
  tags: [],
};

export const useArchiveData = () => {
  const [filterState, setFilterState] = useState<ArchiveFilters>({
    searchQuery: '',
    selectedTags: [],
    contextualTags: [],
  });

  // Use the optimized hook without parameters - it handles all data internally
  const { data, isLoading, error } = useOptimizedArchiveData();

  // Apply client-side filtering based on filter state
  const filteredIssues = useMemo(() => {
    if (!data?.issues) return [];
    
    let filtered = data.issues;
    
    // Apply search query filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        issue.specialty.toLowerCase().includes(query)
      );
    }
    
    // Apply tag filters
    if (filterState.selectedTags.length > 0) {
      filtered = filtered.filter(issue => {
        if (!issue.backend_tags) return false;
        
        try {
          const tags = typeof issue.backend_tags === 'string' 
            ? JSON.parse(issue.backend_tags) 
            : issue.backend_tags;
          
          // Check if any selected tags match the issue's tags
          return filterState.selectedTags.some(selectedTag => {
            if (typeof tags === 'object' && tags !== null) {
              return Object.values(tags).some((tagList: any) => 
                Array.isArray(tagList) && tagList.includes(selectedTag)
              );
            }
            return false;
          });
        } catch {
          return false;
        }
      });
    }
    
    return filtered;
  }, [data?.issues, filterState]);

  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  };

  const selectTag = (tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const issues = filteredIssues;
  const tagConfig = data?.tagConfig || mockTagConfig;

  return {
    issues,
    tagConfig,
    filterState,
    isLoading,
    error,
    selectTag,
    setSearchQuery,
  };
};
