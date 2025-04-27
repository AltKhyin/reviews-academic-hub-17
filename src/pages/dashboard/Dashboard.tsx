
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { data: issues, isLoading } = useIssues();
  const isCollapsed = state === 'collapsed';

  // Filter out unpublished issues for non-admin/editor users
  const visibleIssues = React.useMemo(() => {
    if (!issues) return [];
    if (user?.role === 'admin' || user?.role === 'editor') return issues;
    return issues.filter(issue => issue.published);
  }, [issues, user?.role]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {user && (user.role === 'admin' || user.role === 'editor') && (
        <HomepageSectionsManager />
      )}
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : visibleIssues.length > 0 ? (
        <>
          <FeaturedSection issues={visibleIssues} />
          <ArticlesSection 
            issues={visibleIssues} 
            featuredIssueId={featuredIssue?.id}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No articles available</h2>
          <p className="text-muted-foreground">
            {user?.role === 'admin' || user?.role === 'editor' 
              ? 'Create your first article to get started.'
              : 'Check back later for new articles.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
