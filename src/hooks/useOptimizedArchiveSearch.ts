
// ABOUTME: Optimized archive search with proper hierarchical tag handling
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

// Enhanced search scoring algorithm with tag relevance boosting
const calculateSearchScore = (issue: Issue, searchQuery: string, selectedTags: string[]): number => {
  let score = 0;
  
  // Base relevance score for search query
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
  }
  
  // Tag relevance boosting
  if (selectedTags.length > 0) {
    const tagMatches = calculateHierarchicalTagMatches(issue, selectedTags);
    score += tagMatches * 15;
    
    // Additional boost for specialty exact matches
    if (selectedTags.includes(issue.specialty)) {
      score += 25;
    }
  }
  
  // Base recency score
  const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 100 - daysSinceCreated * 0.1);
  
  return score;
};

// Improved hierarchical tag matching algorithm
const calculateHierarchicalTagMatches = (issue: Issue, selectedTags: string[]): number => {
  if (!selectedTags.length) return 0;
  
  let matches = 0;
  
  selectedTags.forEach(selectedTag => {
    // Check specialty match
    if (issue.specialty?.toLowerCase() === selectedTag.toLowerCase()) {
      matches++;
      return;
    }
    
    // Check backend_tags match with hierarchical support
    if (issue.backend_tags) {
      try {
        const tags = typeof issue.backend_tags === 'string' 
          ? JSON.parse(issue.backend_tags) 
          : issue.backend_tags;
        
        if (typeof tags === 'object' && tags !== null) {
          // Check hierarchical tags - both categories and subcategories
          Object.entries(tags).forEach(([category, tagList]) => {
            // Check if selected tag matches the category
            if (category.toLowerCase() === selectedTag.toLowerCase()) {
              matches++;
              return;
            }
            
            // Check if selected tag matches any subcategory
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

// Improved contextual tags based on hierarchical selection
const getHierarchicalContextualTags = (
  issues: Issue[],
  selectedTags: string[],
  searchQuery: string,
  tagConfig: Record<string, string[]>
): string[] => {
  const contextualTags = new Set<string>();
  const rootCategories = Object.keys(tagConfig);
  
  // If no tags selected, show only root categories
  if (selectedTags.length === 0) {
    rootCategories.forEach(category => {
      contextualTags.add(category);
    });
    return Array.from(contextualTags).slice(0, 12);
  }
  
  // Check if any selected tags are root categories
  const selectedRootCategories = selectedTags.filter(tag => rootCategories.includes(tag));
  
  if (selectedRootCategories.length > 0) {
    // Show subcategories of selected root categories
    selectedRootCategories.forEach(rootCategory => {
      const subcategories = tagConfig[rootCategory] || [];
      subcategories.forEach(sub => {
        if (!selectedTags.includes(sub)) {
          contextualTags.add(sub);
        }
      });
    });
    
    // Also show other root categories
    rootCategories.forEach(category => {
      if (!selectedTags.includes(category)) {
        contextualTags.add(category);
      }
    });
  } else {
    // No root categories selected, show all root categories
    rootCategories.forEach(category => {
      contextualTags.add(category);
    });
  }
  
  return Array.from(contextualTags).slice(0, 10);
};

// Score-based sorting with hierarchical tag support
const scoreAndSortIssues = (
  issues: Issue[],
  filters: SearchFilters
): { sorted: Issue[]; metrics: SearchResult['searchMetrics'] } => {
  const { searchQuery, selectedTags, specialty, year, sortBy } = filters;
  
  const metrics = {
    titleMatches: 0,
    descriptionMatches: 0,
    authorMatches: 0,
    tagMatches: 0,
  };
  
  // Apply hard filters for specialty and year
  let filteredIssues = issues;
  if (specialty) {
    filteredIssues = filteredIssues.filter(issue => issue.specialty === specialty);
  }
  if (year) {
    filteredIssues = filteredIssues.filter(issue => issue.year === year.toString());
  }
  
  // Calculate scores for all remaining issues
  const scoredIssues = filteredIssues.map(issue => {
    const score = calculateSearchScore(issue, searchQuery, selectedTags);
    
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
    
    if (selectedTags.length > 0) {
      const tagMatches = calculateHierarchicalTagMatches(issue, selectedTags);
      if (tagMatches > 0) {
        metrics.tagMatches += tagMatches;
      }
    }
    
    return { ...issue, searchScore: score };
  });
  
  // Sort by score and secondary criteria
  scoredIssues.sort((a, b) => {
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

export const useOptimizedArchiveSearch = (filters: SearchFilters) => {
  // Fetch all data once with aggressive caching
  const { data, isLoading, error } = useOptimizedArchiveData();
  
  // Memoized scoring and sorting with hierarchical tag support
  const searchResult = useMemo((): SearchResult & { contextualTags: string[] } => {
    if (!data?.issues) {
      return {
        issues: [],
        totalCount: 0,
        filteredCount: 0,
        searchMetrics: { titleMatches: 0, descriptionMatches: 0, authorMatches: 0, tagMatches: 0 },
        contextualTags: []
      };
    }
    
    const { sorted, metrics } = scoreAndSortIssues(data.issues, filters);
    const archiveIssues = convertIssuesToArchiveIssues(sorted);
    
    // Calculate hierarchical contextual tags
    const contextualTags = getHierarchicalContextualTags(
      data.issues, 
      filters.selectedTags, 
      filters.searchQuery,
      data.tagConfig || {}
    );
    
    console.log('Hierarchical tag processing:', {
      selectedTags: filters.selectedTags,
      tagConfig: data.tagConfig,
      contextualTags,
      issuesCount: sorted.length
    });
    
    return {
      issues: archiveIssues,
      totalCount: data.totalCount,
      filteredCount: sorted.length,
      searchMetrics: metrics,
      contextualTags
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
