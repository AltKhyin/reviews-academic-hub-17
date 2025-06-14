
// ABOUTME: Optimized archive search hook with intelligent query consolidation
// Replaces multiple individual search and filter queries with single efficient call

import { useState, useCallback, useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';

interface UseOptimizedArchiveSearchResult {
  // Data
  issues: Array<any>;
  totalCount: number;
  filteredCount: number;
  specialties: string[];
  years: string[];
  
  // State
  searchQuery: string;
  selectedTags: string[];
  selectedSpecialty?: string;
  selectedYear?: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedSpecialty: (specialty?: string) => void;
  setSelectedYear: (year?: string) => void;
  clearAllFilters: () => void;
  
  // Status
  isLoading: boolean;
  error: any;
}

export const useOptimizedArchiveSearch = (): UseOptimizedArchiveSearchResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>();
  const [selectedYear, setSelectedYear] = useState<string | undefined>();

  // Use optimized data hook
  const { 
    data: archiveData, 
    isLoading, 
    error 
  } = useOptimizedArchiveData(searchQuery, selectedTags, selectedSpecialty, selectedYear);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedSpecialty(undefined);
    setSelectedYear(undefined);
  }, []);

  // Memoize processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!archiveData) {
      return {
        issues: [],
        totalCount: 0,
        filteredCount: 0,
        specialties: [],
        years: [],
      };
    }

    return {
      issues: archiveData.issues,
      totalCount: archiveData.totalCount,
      filteredCount: archiveData.filteredCount,
      specialties: archiveData.specialties,
      years: archiveData.years,
    };
  }, [archiveData]);

  return {
    // Data
    ...processedData,
    
    // State
    searchQuery,
    selectedTags,
    selectedSpecialty,
    selectedYear,
    
    // Actions
    setSearchQuery,
    setSelectedTags,
    setSelectedSpecialty,
    setSelectedYear,
    clearAllFilters,
    
    // Status
    isLoading,
    error,
  };
};
