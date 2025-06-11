
// ABOUTME: Application navigation hook with consistent routing and error handling
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { NavigationService, ArchiveFilters } from '@/services/navigation';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateToIssue = useCallback((id: string) => {
    try {
      console.log('Navigating to issue:', id);
      navigate(NavigationService.getIssueUrl(id));
    } catch (error) {
      console.error('Navigation failed for issue:', id, error);
      navigate(NavigationService.getHomepageUrl());
    }
  }, [navigate]);

  const navigateToArchive = useCallback((filters?: ArchiveFilters) => {
    try {
      console.log('Navigating to archive with filters:', filters);
      navigate(NavigationService.getArchiveUrl(filters));
    } catch (error) {
      console.error('Navigation failed for archive:', filters, error);
      navigate(NavigationService.getHomepageUrl());
    }
  }, [navigate]);

  const navigateToHomepage = useCallback(() => {
    try {
      navigate(NavigationService.getHomepageUrl());
    } catch (error) {
      console.error('Navigation failed for homepage:', error);
    }
  }, [navigate]);

  const navigateToSearch = useCallback((query?: string) => {
    try {
      console.log('Navigating to search with query:', query);
      navigate(NavigationService.getSearchUrl(query));
    } catch (error) {
      console.error('Navigation failed for search:', query, error);
      navigate(NavigationService.getHomepageUrl());
    }
  }, [navigate]);

  const navigateToCommunity = useCallback(() => {
    try {
      navigate(NavigationService.getCommunityUrl());
    } catch (error) {
      console.error('Navigation failed for community:', error);
    }
  }, [navigate]);

  const navigateToProfile = useCallback(() => {
    try {
      navigate(NavigationService.getProfileUrl());
    } catch (error) {
      console.error('Navigation failed for profile:', error);
    }
  }, [navigate]);

  return {
    navigateToIssue,
    navigateToArchive,
    navigateToHomepage,
    navigateToSearch,
    navigateToCommunity,
    navigateToProfile,
    navigate,
  };
};
