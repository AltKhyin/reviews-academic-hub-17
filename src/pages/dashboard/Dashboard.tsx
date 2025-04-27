
import React, { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile } = useAuth();
  const { data: issues = [], isLoading, refetch } = useIssues();
  const isCollapsed = state === 'collapsed';

  // Refetch issues when user data changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  // Filter out unpublished issues for non-admin/editor users
  const visibleIssues = React.useMemo(() => {
    if (!issues) return [];
    
    // Always log information about issues and profile to help with debugging
    console.log("Issues count:", issues.length, "User role:", profile?.role);
    
    const isAdminOrEditor = profile?.role === 'admin' || profile?.role === 'editor';
    
    // When profile is not yet loaded but we have issues, show all published ones
    if (!profile) {
      return issues.filter(issue => issue.published);
    }
    
    // Admin/editor see all issues, others only see published ones
    return isAdminOrEditor ? issues : issues.filter(issue => issue.published);
  }, [issues, profile]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {profile && (profile.role === 'admin' || profile.role === 'editor') && (
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
            {profile?.role === 'admin' || profile?.role === 'editor' 
              ? 'Create your first article to get started.'
              : 'Check back later for new articles.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
