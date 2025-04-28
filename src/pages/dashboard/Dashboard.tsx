
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';
import { UpcomingReleaseSection } from '@/components/dashboard/UpcomingReleaseSection';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile } = useAuth();
  const { data: issues = [], isLoading, refetch } = useIssues();
  const isCollapsed = state === 'collapsed';
  const { isLoading: sectionsLoading, getSortedVisibleSectionIds, isSectionVisible } = useSectionVisibility();

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

  // Component mapping for each section type
  const renderSection = (sectionId: string) => {
    switch(sectionId) {
      case 'reviewer':
        return <ReviewerCommentsDisplay key="reviewer" />;
      case 'featured':
        return <FeaturedSection key="featured" issues={visibleIssues} />;
      case 'upcoming':
        return <UpcomingReleaseSection key="upcoming" />;
      case 'recent':
        return <ArticlesSection 
          key="recent"
          issues={visibleIssues.slice(0, 5)} 
          featuredIssueId={featuredIssue?.id} 
          sectionTitle="Edições Recentes"
          sectionType="recent"
        />;
      case 'recommended':
        const recommended = [...visibleIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          key="recommended"
          issues={recommended} 
          featuredIssueId={featuredIssue?.id} 
          sectionTitle="Recomendados para você"
          sectionType="recommended"
        />;
      case 'trending':
        const trending = [...visibleIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          key="trending"
          issues={trending} 
          featuredIssueId={featuredIssue?.id} 
          sectionTitle="Mais acessados"
          sectionType="trending"
        />;
      default:
        return null;
    }
  };

  const visibleSectionIds = getSortedVisibleSectionIds();

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {isLoading || sectionsLoading ? (
        <DashboardSkeleton />
      ) : visibleIssues.length > 0 ? (
        <>
          {visibleSectionIds.map(renderSection)}
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
