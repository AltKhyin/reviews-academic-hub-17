
// ABOUTME: Simplified archive search with text-based filtering, optimized for tag reordering integration
import { useMemo } from 'react';
import { useOptimizedArchiveData } from './useOptimizedArchiveData';
import { Issue } from '@/types/issue';
import { ArchiveIssue } from '@/types/archive';
import { convertIssuesToArchiveIssues } from '@/utils/archiveHelpers';

interface SearchFilters {
  searchQuery: string;
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
  };
}

// Simple search scoring algorithm for text queries only
const calculateSearchScore = (issue: Issue, searchQuery: string): number => {
  let score = 0;
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    
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
  }
  
  // Base recency score to ensure consistent ordering when no search query
  const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 100 - daysSinceCreated * 0.1);
  
  return score;
};

// Simple filtering and sorting for text search only
const filterAndSortIssues = (
  issues: Issue[],
  filters: SearchFilters
): { sorted: Issue[]; metrics: SearchResult['searchMetrics'] } => {
  const { searchQuery, specialty, year, sortBy } = filters;
  
  const metrics = {
    titleMatches: 0,
    descriptionMatches: 0,
    authorMatches: 0,
  };
  
  // Apply hard filters
  let filteredIssues = issues;
  
  // Filter by search query (if provided)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredIssues = filteredIssues.filter(issue => {
      const searchableText = [
        issue.title,
        issue.description,
        issue.specialty,
        issue.authors,
        issue.search_title,
        issue.search_description
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
  }
  
  // Filter by specialty (if provided)
  if (specialty) {
    filteredIssues = filteredIssues.filter(issue => issue.specialty === specialty);
  }
  
  // Filter by year (if provided)
  if (year) {
    filteredIssues = filteredIssues.filter(issue => issue.year === year.toString());
  }
  
  // Calculate scores for all remaining issues
  const scoredIssues = filteredIssues.map(issue => {
    const score = calculateSearchScore(issue, searchQuery);
    
    // Update metrics for matching issues
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (issue.title?.toLowerCase().includes(query) || 
          issue.search_title?.toLowerCase().includes(query)) {
        metrics.titleMatches++;
      }
      if (issue.description?.toLowerCase().includes(query) || 
          issue.search_description?.toLowerCase().includes(query)) {
        metrics.descriptionMatches++;
      }
      if (issue.authors?.toLowerCase().includes(query)) {
        metrics.authorMatches++;
      }
    }
    
    return { ...issue, searchScore: score };
  });
  
  // Sort by score and secondary criteria
  scoredIssues.sort((a, b) => {
    // If no search query, sort by creation date (newest first) for tag reordering compatibility
    if (!searchQuery.trim()) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    switch (sortBy) {
      case 'score':
        return b.searchScore - a.searchScore;
      case 'newest':
        if (Math.abs(b.searchScore - a.searchScore) < 5) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return b.searchScore - a.searchScore;
      case 'oldest':
        if (Math.abs(b.searchScore - a.searchScore) < 5) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return b.searchScore - a.searchScore;
      case 'title':
        if (Math.abs(b.searchScore - a.searchScore) < 5) {
          return (a.title || '').localeCompare(b.title || '');
        }
        return b.searchScore - a.searchScore;
      default:
        return b.searchScore - a.searchScore;
    }
  });
  
  return { sorted: scoredIssues, metrics };
};

export const useSimplifiedArchiveSearch = (filters: SearchFilters) => {
  // Fetch all data once with aggressive caching
  const { data, isLoading, error } = useOptimizedArchiveData();
  
  // Memoized filtering and sorting - optimized for tag reordering
  const searchResult = useMemo((): SearchResult => {
    if (!data?.issues) {
      return {
        issues: [],
        totalCount: 0,
        filteredCount: 0,
        searchMetrics: { titleMatches: 0, descriptionMatches: 0, authorMatches: 0 },
      };
    }
    
    const { sorted, metrics } = filterAndSortIssues(data.issues, filters);
    const archiveIssues = convertIssuesToArchiveIssues(sorted);
    
    return {
      issues: archiveIssues,
      totalCount: data.totalCount,
      filteredCount: sorted.length,
      searchMetrics: metrics,
    };
  }, [data, filters.searchQuery, filters.specialty, filters.year, filters.sortBy]);
  
  return {
    ...searchResult,
    isLoading,
    error,
    // Additional utilities
    hasActiveFilters: !!(filters.searchQuery.trim() || filters.specialty || filters.year),
    specialties: data?.specialties || [],
    years: data?.years || [],
  };
};
