
// ABOUTME: Centralized navigation service for consistent URL generation and routing
import { useNavigate } from 'react-router-dom';

export interface ArchiveFilters {
  specialty?: string;
  year?: string;
  search?: string;
  page?: number;
}

export class NavigationService {
  // Static URL generators
  static getIssueUrl(id: string): string {
    return `/article/${id}`;
  }

  static getArchiveUrl(filters?: ArchiveFilters): string {
    if (!filters || Object.keys(filters).length === 0) {
      return '/acervo';
    }

    const params = new URLSearchParams();
    
    if (filters.specialty) params.set('specialty', filters.specialty);
    if (filters.year) params.set('year', filters.year);
    if (filters.search) params.set('search', filters.search);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

    return `/acervo?${params.toString()}`;
  }

  static getHomepageUrl(): string {
    return '/homepage';
  }

  static getCommunityUrl(): string {
    return '/community';
  }

  static getSearchUrl(query?: string): string {
    return query ? `/search?q=${encodeURIComponent(query)}` : '/search';
  }

  static getProfileUrl(): string {
    return '/profile';
  }

  static getEditUrl(issueId?: string): string {
    return issueId ? `/edit/issue/${issueId}` : '/edit';
  }

  // Navigation helper with error handling
  static navigateWithFallback(navigate: ReturnType<typeof useNavigate>, url: string, fallbackUrl?: string) {
    try {
      navigate(url);
    } catch (error) {
      console.error('Navigation failed:', error);
      if (fallbackUrl) {
        navigate(fallbackUrl);
      }
    }
  }
}

// Hook for navigation with consistent error handling
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateToIssue = (id: string) => {
    NavigationService.navigateWithFallback(
      navigate, 
      NavigationService.getIssueUrl(id),
      NavigationService.getHomepageUrl()
    );
  };

  const navigateToArchive = (filters?: ArchiveFilters) => {
    NavigationService.navigateWithFallback(
      navigate,
      NavigationService.getArchiveUrl(filters),
      NavigationService.getHomepageUrl()
    );
  };

  const navigateToHomepage = () => {
    navigate(NavigationService.getHomepageUrl());
  };

  const navigateToSearch = (query?: string) => {
    NavigationService.navigateWithFallback(
      navigate,
      NavigationService.getSearchUrl(query),
      NavigationService.getHomepageUrl()
    );
  };

  return {
    navigateToIssue,
    navigateToArchive,
    navigateToHomepage,
    navigateToSearch,
    navigate,
  };
};

// Utility for building query strings
export const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};
