
// ABOUTME: Main dashboard displaying issues with hero section and article rows
// Now uses full screen width with responsive padding for optimal space utilization

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
      <div className="w-full">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="w-full">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
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

  const renderSection = (sectionId: string, index: number) => {
    if (!isSectionVisible(sectionId)) return null;

    // Special spacing for reviewer comments when followed by featured section
    const isReviewerSection = sectionId === 'reviews';
    const nextSection = visibleSectionIds[index + 1];
    const isFollowedByFeatured = nextSection === 'featured';
    
    switch (sectionId) {
      case 'reviews':
        return (
          <div key={`reviews-${index}`} className={isFollowedByFeatured ? 'mb-4' : ''}>
            <ReviewerCommentsDisplay />
          </div>
        );
        
      case 'reviewer':
        // Skip duplicate reviewer section
        return null;
        
      case 'featured':
        if (!featuredIssue) return null;
        return (
          <div key={`featured-${featuredIssue.id}-${index}`}>
            <HeroSection featuredIssue={featuredIssue} />
          </div>
        );
        
      case 'upcoming':
        return (
          <div key={`upcoming-${index}`}>
            <UpcomingReleaseCard />
          </div>
        );
        
      case 'recent':
        if (recentIssues.length === 0) return null;
        return (
          <div key={`recent-${index}`}>
            <ArticleRow title="Edições Recentes" articles={recentIssues} />
          </div>
        );
        
      case 'recommended':
        if (recommendedIssues.length === 0) return null;
        return (
          <div key={`recommended-${index}`}>
            <ArticleRow title="Recomendados para você" articles={recommendedIssues} />
          </div>
        );
        
      case 'trending':
        if (trendingIssues.length === 0) return null;
        return (
          <div key={`trending-${index}`}>
            <ArticleRow title="Mais acessados" articles={trendingIssues} />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="space-y-8">
          {visibleSectionIds.map((sectionId, index) => {
            const sectionElement = renderSection(sectionId, index);
            // Only render if we have a valid element
            if (!sectionElement) return null;
            return sectionElement;
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
