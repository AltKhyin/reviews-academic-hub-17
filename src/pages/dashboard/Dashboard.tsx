
import React from 'react';
import { useIssues } from '@/hooks/useIssues';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { HeroSection } from '@/components/dashboard/HeroSection';
import ArticleRow from '@/components/dashboard/ArticleRow';
import { UpcomingReleaseCard } from '@/components/dashboard/UpcomingReleaseCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

const Dashboard = () => {
  const { data: issues, isLoading } = useIssues();
  const { getSortedVisibleSectionIds, isSectionVisible } = useSectionVisibility();
  const { isAdmin, isEditor } = useAuth();

  console.log('Dashboard: Rendering with', issues?.length || 0, 'issues');

  if (isLoading) {
    return (
      <div className="h-full max-w-6xl mx-auto">
        <div className="pt-4 pb-16 space-y-8 transition-all duration-300 max-w-[95%] mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="h-full max-w-6xl mx-auto">
        <div className="pt-4 pb-16 space-y-8 transition-all duration-300 max-w-[95%] mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Nenhum conteúdo disponível</h2>
            <p className="text-muted-foreground">
              Aguarde novos conteúdos serem publicados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find featured issue for hero section
  const featuredIssue = issues.find(issue => issue.featured) || issues[0];
  
  // Filter out featured issue from other sections to avoid duplication
  const nonFeaturedIssues = issues.filter(issue => issue.id !== featuredIssue.id);
  
  // Organize issues by type for different sections
  const recentIssues = nonFeaturedIssues
    .filter(issue => issue.published)
    .slice(0, 10);
    
  const recommendedIssues = nonFeaturedIssues
    .filter(issue => issue.published)
    .slice(0, 10);
    
  const trendingIssues = nonFeaturedIssues
    .filter(issue => issue.published)
    .slice(0, 10);

  const visibleSectionIds = getSortedVisibleSectionIds();

  console.log('Dashboard: Visible sections:', visibleSectionIds);
  console.log('Dashboard: Featured issue:', featuredIssue?.id);

  const renderSection = (sectionId: string) => {
    if (!isSectionVisible(sectionId)) return null;

    switch (sectionId) {
      case 'reviews':
        // Only show for admin/editor
        if (!isAdmin && !isEditor) return null;
        return <ReviewerCommentsDisplay key="reviews" />;
        
      case 'reviewer':
        return <ReviewerCommentsDisplay key="reviewer" />;
        
      case 'featured':
        if (!featuredIssue) return null;
        return <HeroSection key="featured" featuredIssue={featuredIssue} />;
        
      case 'upcoming':
        return <UpcomingReleaseCard key="upcoming" />;
        
      case 'recent':
        if (recentIssues.length === 0) return null;
        return <ArticleRow key="recent" title="Edições Recentes" articles={recentIssues} />;
        
      case 'recommended':
        if (recommendedIssues.length === 0) return null;
        return <ArticleRow key="recommended" title="Recomendados para você" articles={recommendedIssues} />;
        
      case 'trending':
        if (trendingIssues.length === 0) return null;
        return <ArticleRow key="trending" title="Mais acessados" articles={trendingIssues} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="h-full max-w-6xl mx-auto">
      <div className="pt-4 pb-16 space-y-8 transition-all duration-300 max-w-[95%] mx-auto">
        {visibleSectionIds.map(sectionId => renderSection(sectionId))}
      </div>
    </div>
  );
};

export default Dashboard;
