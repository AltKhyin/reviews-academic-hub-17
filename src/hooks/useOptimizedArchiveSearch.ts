
// ABOUTME: Optimized archive search with client-side filtering and intelligent caching
import { useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';
import { Issue } from '@/types/issue';
import { ArchiveIssue } from '@/types/archive';
import { convertIssuesToArchiveIssues } from '@/utils/archiveHelpers';

interface SearchFilters {
  searchQuery: string;
  selectedTags: string[];
  specialty?: string;
  year?: number;
  sortBy?: 'newest' | 'oldest' | 'title' | 'score';
}

interface SearchResult {
  issues: ArchiveIssue[];
  totalCount: number;
  filteredCount: number;
  searchMetrics: {
    titleMatches: number;
    descriptionMatches: number;
    authorMatches: number;
    tagMatches: number;
  };
}

// Client-side search scoring algorithm
const calculateSearchScore = (issue: Issue, searchQuery: string): number => {
  if (!searchQuery.trim()) return 0;
  
  const query = searchQuery.toLowerCase();
  let score = 0;
  
  // Title matches (highest priority)
  if (issue.title?.toLowerCase().includes(query)) score += 10;
  if (issue.search_title?.toLowerCase().includes(query)) score += 8;
  
  // Author matches
  if (issue.authors?.toLowerCase().includes(query)) score += 6;
  
  // Description matches
  if (issue.description?.toLowerCase().includes(query)) score += 4;
  if (issue.search_description?.toLowerCase().includes(query)) score += 3;
  
  // Specialty matches
  if (issue.specialty?.toLowerCase().includes(query)) score += 5;
  
  // Backend tags matches
  if (issue.backend_tags?.toLowerCase().includes(query)) score += 2;
  
  return score;
};

// Tag matching algorithm
const calculateTagMatches = (issue: Issue, selectedTags: string[]): number => {
  if (!selectedTags.length) return 0;
  
  let matches = 0;
  const issueData = `${issue.specialty} ${issue.backend_tags}`.toLowerCase();
  
  selectedTags.forEach(tag => {
    if (issueData.includes(tag.toLowerCase())) {
      matches++;
    }
  });
  
  return matches;
};

// Advanced filtering with performance optimization
const filterAndSortIssues = (
  issues: Issue[],
  filters: SearchFilters
): { filtered: Issue[]; metrics: SearchResult['searchMetrics'] } => {
  const { searchQuery, selectedTags, specialty, year, sortBy } = filters;
  
  const metrics = {
    titleMatches: 0,
    descriptionMatches: 0,
    authorMatches: 0,
    tagMatches: 0,
  };
  
  let filtered = issues.filter(issue => {
    // Specialty filter
    if (specialty && issue.specialty !== specialty) return false;
    
    // Year filter
    if (year && issue.year !== year.toString()) return false;
    
    // Tag filter
    if (selectedTags.length > 0) {
      const tagMatches = calculateTagMatches(issue, selectedTags);
      if (tagMatches === 0) return false;
      metrics.tagMatches += tagMatches;
    }
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const hasMatch = 
        issue.title?.toLowerCase().includes(query) ||
        issue.search_title?.toLowerCase().includes(query) ||
        issue.authors?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        issue.search_description?.toLowerCase().includes(query) ||
        issue.specialty?.toLowerCase().includes(query) ||
        issue.backend_tags?.toLowerCase().includes(query);
      
      if (!hasMatch) return false;
      
      // Count metrics
      if (issue.title?.toLowerCase().includes(query) || issue.search_title?.toLowerCase().includes(query)) {
        metrics.titleMatches++;
      }
      if (issue.description?.toLowerCase().includes(query) || issue.search_description?.toLowerCase().includes(query)) {
        metrics.descriptionMatches++;
      }
      if (issue.authors?.toLowerCase().includes(query)) {
        metrics.authorMatches++;
      }
    }
    
    return true;
  });
  
  // Sort results
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'score':
        if (searchQuery.trim()) {
          const scoreA = calculateSearchScore(a, searchQuery);
          const scoreB = calculateSearchScore(b, searchQuery);
          return scoreB - scoreA;
        }
        return (b.score || 0) - (a.score || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return { filtered, metrics };
};

export const useOptimizedArchiveSearch = (filters: SearchFilters) => {
  // Fetch all data once with aggressive caching
  const { data, isLoading, error } = useOptimizedArchiveData({
    // Don't pass search/filters to backend - we'll handle client-side
  });
  
  // Memoized filtering and sorting
  const searchResult = useMemo((): SearchResult => {
    if (!data?.issues) {
      return {
        issues: [],
        totalCount: 0,
        filteredCount: 0,
        searchMetrics: { titleMatches: 0, descriptionMatches: 0, authorMatches: 0, tagMatches: 0 }
      };
    }
    
    const { filtered, metrics } = filterAndSortIssues(data.issues, filters);
    const archiveIssues = convertIssuesToArchiveIssues(filtered);
    
    return {
      issues: archiveIssues,
      totalCount: data.totalCount,
      filteredCount: filtered.length,
      searchMetrics: metrics
    };
  }, [data, filters.searchQuery, filters.selectedTags, filters.specialty, filters.year, filters.sortBy]);
  
  return {
    ...searchResult,
    isLoading,
    error,
    // Additional utilities
    hasActiveFilters: !!(filters.searchQuery.trim() || filters.selectedTags.length || filters.specialty || filters.year),
    specialties: data?.specialties || [],
    years: data?.years || [],
  };
};
