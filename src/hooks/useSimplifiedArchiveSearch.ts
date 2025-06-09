
// ABOUTME: Simplified archive search hook with text filtering and optimized queries
import { useState, useEffect, useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';
import { Issue } from '@/types/issue';

interface ArchiveSearchParams {
  searchQuery?: string;
  specialty?: string;
  year?: string;
  limit?: number;
}

interface ArchiveSearchResult {
  issues: Issue[];
  totalCount: number;
  filteredCount: number;
  isLoading: boolean;
  specialties: string[];
  years: string[];
  error: any;
}

export const useSimplifiedArchiveSearch = (params: ArchiveSearchParams = {}): ArchiveSearchResult => {
  const { searchQuery = '', specialty, year, limit } = params;
  
  // Get all archive data using the optimized hook
  const { data, isLoading, error } = useOptimizedArchiveData();
  
  // Filter issues based on search parameters
  const filteredIssues = useMemo(() => {
    let filtered = data.issues;
    
    // Text search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(issue => {
        const searchableText = [
          issue.title,
          issue.description,
          issue.authors,
          issue.specialty,
          issue.search_title,
          issue.search_description,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }
    
    // Specialty filtering
    if (specialty) {
      filtered = filtered.filter(issue => issue.specialty === specialty);
    }
    
    // Year filtering  
    if (year) {
      filtered = filtered.filter(issue => issue.year === year);
    }
    
    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [data.issues, searchQuery, specialty, year, limit]);

  return {
    issues: filteredIssues,
    totalCount: data.totalCount,
    filteredCount: filteredIssues.length,
    isLoading,
    specialties: data.specialties,
    years: data.years,
    error,
  };
};
