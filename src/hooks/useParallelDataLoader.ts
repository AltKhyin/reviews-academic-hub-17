
// ABOUTME: Migrated parallel data loader to use unified coordination system
import { useUnifiedQuery } from './useUnifiedQuery';
import { GlobalRequestManager } from '@/core/GlobalRequestManager';
import { DataAccessLayer } from '@/core/DataAccessLayer';
import { useMemo } from 'react';

export const useParallelDataLoader = () => {
  const requestManager = GlobalRequestManager.getInstance();
  const dataLayer = DataAccessLayer.getInstance();

  // Load issues using unified system with request coordination  
  const { data: issues, isLoading: issuesLoading, error: issuesError, refetch: refetchIssues } = useUnifiedQuery(
    ['dashboard-issues'],
    async () => {
      const result = await requestManager.executeRequest({
        key: 'dashboard-issues-bulk',
        operation: () => dataLayer.executeOperation({
          type: 'query',
          resource: 'issues',
          parameters: {
            published: true,
            limit: 50,
            order: { column: 'created_at', ascending: false }
          }
        }),
        priority: 'critical'
      });
      return result.data;
    },
    { priority: 'critical' }
  );

  // Load section visibility config using unified system
  const { data: sectionVisibility, isLoading: sectionLoading, error: sectionError } = useUnifiedQuery(
    ['dashboard-section-visibility'],
    async () => {
      const result = await dataLayer.executeOperation({
        type: 'query',
        resource: 'dashboard_section_visibility',
        parameters: {}
      });
      
      // Return default config if none exists
      return result.data || [
        { id: 'reviewer', visible: true, order: 1 },
        { id: 'featured', visible: true, order: 2 },
        { id: 'recent', visible: true, order: 3 },
        { id: 'recommended', visible: true, order: 4 },
        { id: 'trending', visible: true, order: 5 },
        { id: 'upcoming', visible: true, order: 6 }
      ];
    },
    { priority: 'normal' }
  );

  // Determine featured issue from loaded issues
  const featuredIssue = useMemo(() => {
    return issues?.find(issue => issue.featured) || null;
  }, [issues]);

  // Aggregate loading states
  const isLoading = issuesLoading || sectionLoading;
  
  // Aggregate errors
  const errors = useMemo(() => {
    const errorMap: Record<string, Error> = {};
    if (issuesError) errorMap.issues = issuesError;
    if (sectionError) errorMap.sectionVisibility = sectionError;
    return errorMap;
  }, [issuesError, sectionError]);

  const retryFailed = async () => {
    await Promise.all([
      refetchIssues()
    ]);
  };

  return {
    issues: issues || [],
    sectionVisibility: sectionVisibility || [],
    featuredIssue,
    isLoading,
    errors,
    retryFailed
  };
};
