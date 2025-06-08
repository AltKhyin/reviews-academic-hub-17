
// ABOUTME: Optimized archive search with hierarchical backend_tags and client-side filtering
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
  if (issue.backend_tags) {
    try {
      const tags = typeof issue.backend_tags === 'string' 
        ? JSON.parse(issue.backend_tags) 
        : issue.backend_tags;
      
      const tagString = JSON.stringify(tags).toLowerCase();
      if (tagString.includes(query)) score += 3;
    } catch (e) {
      if (typeof issue.backend_tags === 'string' && 
          issue.backend_tags.toLowerCase().includes(query)) {
        score += 3;
      }
    }
  }
  
  return score;
};

// Hierarchical tag matching algorithm
const calculateTagMatches = (issue: Issue, selectedTags: string[]): number => {
  if (!selectedTags.length) return 0;
  
  let matches = 0;
  
  selectedTags.forEach(selectedTag => {
    // Check specialty match
    if (issue.specialty?.toLowerCase() === selectedTag.toLowerCase()) {
      matches++;
      return;
    }
    
    // Check backend_tags match
    if (issue.backend_tags) {
      try {
        const tags = typeof issue.backend_tags === 'string' 
          ? JSON.parse(issue.backend_tags) 
          : issue.backend_tags;
        
        if (typeof tags === 'object') {
          // Check hierarchical tags
          Object.values(tags).forEach(tagList => {
            if (Array.isArray(tagList)) {
              tagList.forEach(tag => {
                if (typeof tag === 'string' && 
                    tag.toLowerCase() === selectedTag.toLowerCase()) {
                  matches++;
                }
              });
            }
          });
        } else if (typeof tags === 'string' && 
                   tags.toLowerCase() === selectedTag.toLowerCase()) {
          matches++;
        }
      } catch (e) {
        // If parsing fails, treat as string
        if (typeof issue.backend_tags === 'string' && 
            issue.backend_tags.toLowerCase() === selectedTag.toLowerCase()) {
          matches++;
        }
      }
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
    
    // Tag filter (hierarchical)
    if (selectedTags.length > 0) {
      const tagMatches = calculateTagMatches(issue, selectedTags);
      if (tagMatches === 0) return false;
      metrics.tagMatches += tagMatches;
    }
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      let hasMatch = false;
      
      // Title match
      if (issue.title?.toLowerCase().includes(query) || 
          issue.search_title?.toLowerCase().includes(query)) {
        hasMatch = true;
        metrics.titleMatches++;
      }
      
      // Description match
      if (issue.description?.toLowerCase().includes(query) || 
          issue.search_description?.toLowerCase().includes(query)) {
        hasMatch = true;
        metrics.descriptionMatches++;
      }
      
      // Author match
      if (issue.authors?.toLowerCase().includes(query)) {
        hasMatch = true;
        metrics.authorMatches++;
      }
      
      // Specialty match
      if (issue.specialty?.toLowerCase().includes(query)) {
        hasMatch = true;
      }
      
      // Backend tags match
      if (issue.backend_tags) {
        try {
          const tags = typeof issue.backend_tags === 'string' 
            ? JSON.parse(issue.backend_tags) 
            : issue.backend_tags;
          
          const tagString = JSON.stringify(tags).toLowerCase();
          if (tagString.includes(query)) {
            hasMatch = true;
            metrics.tagMatches++;
          }
        } catch (e) {
          if (typeof issue.backend_tags === 'string' && 
              issue.backend_tags.toLowerCase().includes(query)) {
            hasMatch = true;
            metrics.tagMatches++;
          }
        }
      }
      
      if (!hasMatch) return false;
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
  const { data, isLoading, error } = useOptimizedArchiveData();
  
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
    // Additional utilities with proper tag config
    hasActiveFilters: !!(filters.searchQuery.trim() || filters.selectedTags.length || filters.specialty || filters.year),
    specialties: data?.specialties || [],
    years: data?.years || [],
    tagConfig: data?.tagConfig || {},
  };
};
