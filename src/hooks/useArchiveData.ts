
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

  // Use the optimized hook with current filter state
  const { data, isLoading, error } = useOptimizedArchiveData({
    search: filterState.searchQuery,
    tags: filterState.selectedTags,
  });

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

  const issues = data?.issues || [];
  const tagConfig = mockTagConfig; // This would be fetched from your tag configuration system

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
