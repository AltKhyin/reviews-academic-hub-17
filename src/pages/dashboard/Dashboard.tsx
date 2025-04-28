import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';
import { UpcomingReleaseSection } from '@/components/dashboard/UpcomingReleaseSection';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile } = useAuth();
  const { data: issues = [], isLoading, refetch } = useIssues();
  const isCollapsed = state === 'collapsed';

  const visibleIssues = React.useMemo(() => {
    if (!issues) return [];
    
    console.log("Issues count:", issues.length, "User role:", profile?.role);
    
    const isAdminOrEditor = profile?.role === 'admin' || profile?.role === 'editor';
    
    if (!profile) {
      return issues.filter(issue => issue.published);
    }
    
    return isAdminOrEditor ? issues : issues.filter(issue => issue.published);
  }, [issues, profile]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  const ArticleRow = ({ title, section, issues, featuredIssueId }: { 
    title: string; 
    section: string; 
    issues: any[]; 
    featuredIssueId?: string;
  }) => {
    const filteredIssues = issues.filter(issue => issue.id !== featuredIssueId);
    
    if (filteredIssues.length === 0) {
      return null;
    }
    
    switch(section) {
      case 'recent':
        return <ArticlesSection 
          issues={filteredIssues.slice(0, 5)} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="recent"
        />;
      case 'recommended':
        const recommended = [...filteredIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          issues={recommended} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="recommended"
        />;
      case 'trending':
        const trending = [...filteredIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          issues={trending} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="trending"
        />;
      default:
        return null;
    }
  };

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {isLoading ? (
        <DashboardSkeleton />
      ) : visibleIssues.length > 0 ? (
        <>
          <FeaturedSection issues={visibleIssues} />
          <UpcomingReleaseSection />
          <ArticleRow title="Edições Recentes" section="recent" issues={visibleIssues} featuredIssueId={featuredIssue?.id} />
          <ArticleRow title="Recomendados para você" section="recommended" issues={visibleIssues} featuredIssueId={featuredIssue?.id} />
          <ArticleRow title="Mais acessados" section="trending" issues={visibleIssues} featuredIssueId={featuredIssue?.id} />
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
