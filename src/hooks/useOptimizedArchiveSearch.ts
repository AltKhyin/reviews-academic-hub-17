
// ABOUTME: Optimized archive search with hierarchical backend_tags and ranking-based ordering
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
  sortBy?: 'newest' | 'oldest' | 'title' | 'relevance';
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

// Enhanced search scoring algorithm with tag ranking
const calculateSearchScore = (issue: Issue, searchQuery: string, selectedTags: string[]): number => {
  let score = 0;
  
  // Base search query scoring
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
  
  // Tag ranking boost (this is the key change - ranking instead of filtering)
  const tagBoost = calculateTagRelevanceScore(issue, selectedTags);
  score += tagBoost;
  
  return score;
};

// New function for tag-based relevance scoring
const calculateTagRelevanceScore = (issue: Issue, selectedTags: string[]): number => {
  if (!selectedTags.length) return 0;
  
  let relevanceScore = 0;
  
  selectedTags.forEach(selectedTag => {
    // Direct specialty match (highest boost)
    if (issue.specialty?.toLowerCase() === selectedTag.toLowerCase()) {
      relevanceScore += 20;
      return;
    }
    
    // Backend tags hierarchical matching
    if (issue.backend_tags) {
      try {
        const tags = typeof issue.backend_tags === 'string' 
          ? JSON.parse(issue.backend_tags) 
          : issue.backend_tags;
        
        if (typeof tags === 'object') {
          // Check hierarchical tags with category weighting
          Object.entries(tags).forEach(([category, tagList]) => {
            if (Array.isArray(tagList)) {
              tagList.forEach(tag => {
                if (typeof tag === 'string' && 
                    tag.toLowerCase() === selectedTag.toLowerCase()) {
                  // Weight based on category importance
                  switch (category.toLowerCase()) {
                    case 'especialidades':
                      relevanceScore += 15;
                      break;
                    case 'metodologia':
                      relevanceScore += 12;
                      break;
                    case 'população':
                      relevanceScore += 10;
                      break;
                    default:
                      relevanceScore += 8;
                  }
                }
              });
            }
          });
        } else if (typeof tags === 'string' && 
                   tags.toLowerCase() === selectedTag.toLowerCase()) {
          relevanceScore += 10;
        }
      } catch (e) {
        if (typeof issue.backend_tags === 'string' && 
            issue.backend_tags.toLowerCase() === selectedTag.toLowerCase()) {
          relevanceScore += 10;
        }
      }
    }
    
    // Partial matches for related content
    if (issue.title?.toLowerCase().includes(selectedTag.toLowerCase())) {
      relevanceScore += 5;
    }
    if (issue.description?.toLowerCase().includes(selectedTag.toLowerCase())) {
      relevanceScore += 3;
    }
  });
  
  return relevanceScore;
};

// Get contextual/related tags based on selected tags and issue content
const getContextualTags = (
  issues: Issue[], 
  selectedTags: string[], 
  tagConfig: Record<string, string[]>
): string[] => {
  const contextualTags = new Set<string>();
  
  // If no tags selected, return empty
  if (!selectedTags.length) return [];
  
  // Find related tags from the same categories
  selectedTags.forEach(selectedTag => {
    Object.entries(tagConfig).forEach(([category, tags]) => {
      if (tags.includes(selectedTag)) {
        // Add other tags from the same category
        tags.forEach(relatedTag => {
          if (relatedTag !== selectedTag) {
            contextualTags.add(relatedTag);
          }
        });
      }
    });
  });
  
  // Find tags that frequently appear with selected tags in issues
  const coOccurringTags = new Set<string>();
  issues.forEach(issue => {
    const hasSelectedTag = selectedTags.some(tag => 
      calculateTagRelevanceScore(issue, [tag]) > 0
    );
    
    if (hasSelectedTag && issue.backend_tags) {
      try {
        const tags = typeof issue.backend_tags === 'string' 
          ? JSON.parse(issue.backend_tags) 
          : issue.backend_tags;
        
        if (typeof tags === 'object') {
          Object.values(tags).forEach(tagList => {
            if (Array.isArray(tagList)) {
              tagList.forEach(tag => {
                if (typeof tag === 'string' && !selectedTags.includes(tag)) {
                  coOccurringTags.add(tag);
                }
              });
            }
          });
        }
      } catch (e) {
        // Handle string tags
      }
    }
  });
  
  // Combine and limit contextual tags
  const allContextual = [...contextualTags, ...coOccurringTags];
  return allContextual.slice(0, 8); // Limit to prevent UI clutter
};

// Enhanced filtering and sorting with ranking instead of exclusion
const rankAndSortIssues = (
  issues: Issue[],
  filters: SearchFilters
): { ranked: Issue[]; metrics: SearchResult['searchMetrics'] } => {
  const { searchQuery, selectedTags, specialty, year, sortBy } = filters;
  
  const metrics = {
    titleMatches: 0,
    descriptionMatches: 0,
    authorMatches: 0,
    tagMatches: 0,
  };
  
  // First, apply hard filters (specialty, year) - these still filter completely
  let filtered = issues.filter(issue => {
    if (specialty && issue.specialty !== specialty) return false;
    if (year && issue.year !== year.toString()) return false;
    return true;
  });
  
  // Calculate scores for all remaining issues
  const scoredIssues = filtered.map(issue => {
    const score = calculateSearchScore(issue, searchQuery, selectedTags);
    
    // Update metrics for search query matches
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
    
    // Update tag metrics
    if (selectedTags.length > 0) {
      const tagScore = calculateTagRelevanceScore(issue, selectedTags);
      if (tagScore > 0) {
        metrics.tagMatches++;
      }
    }
    
    return { ...issue, searchScore: score };
  });
  
  // Sort based on selected criteria
  scoredIssues.sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        // Sort by search score first, then by recency
        if (b.searchScore !== a.searchScore) {
          return b.searchScore - a.searchScore;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      
      default:
        // Default: if tags are selected, use relevance; otherwise use newest
        if (selectedTags.length > 0 || searchQuery.trim()) {
          if (b.searchScore !== a.searchScore) {
            return b.searchScore - a.searchScore;
          }
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return { ranked: scoredIssues, metrics };
};

export const useOptimizedArchiveSearch = (filters: SearchFilters) => {
  // Fetch all data once with aggressive caching
  const { data, isLoading, error } = useOptimizedArchiveData();
  
  // Memoized ranking and sorting
  const searchResult = useMemo((): SearchResult & { 
    contextualTags: string[];
    hasActiveFilters: boolean;
    specialties: string[];
    years: string[];
    tagConfig: Record<string, string[]>;
  } => {
    if (!data?.issues) {
      return {
        issues: [],
        totalCount: 0,
        filteredCount: 0,
        searchMetrics: { titleMatches: 0, descriptionMatches: 0, authorMatches: 0, tagMatches: 0 },
        contextualTags: [],
        hasActiveFilters: false,
        specialties: [],
        years: [],
        tagConfig: {}
      };
    }
    
    const { ranked, metrics } = rankAndSortIssues(data.issues, filters);
    const archiveIssues = convertIssuesToArchiveIssues(ranked);
    
    // Get contextual tags based on current selection
    const contextualTags = getContextualTags(data.issues, filters.selectedTags, data.tagConfig);
    
    return {
      issues: archiveIssues,
      totalCount: data.totalCount,
      filteredCount: ranked.length,
      searchMetrics: metrics,
      contextualTags,
      hasActiveFilters: !!(filters.searchQuery.trim() || filters.selectedTags.length || filters.specialty || filters.year),
      specialties: data.specialties || [],
      years: data.years || [],
      tagConfig: data.tagConfig || {},
    };
  }, [data, filters.searchQuery, filters.selectedTags, filters.specialty, filters.year, filters.sortBy]);
  
  return {
    ...searchResult,
    isLoading,
    error,
  };
};
