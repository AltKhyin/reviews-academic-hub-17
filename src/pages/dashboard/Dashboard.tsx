
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

  const featuredIssue = issues?.find(issue => issue.featured) || issues?.[0];

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {user && (user.role === 'admin' || user.role === 'editor') && (
        <HomepageSectionsManager />
      )}
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : issues ? (
        <>
          <FeaturedSection issues={issues} />
          <ArticlesSection 
            issues={issues} 
            featuredIssueId={featuredIssue?.id}
          />
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
