
// ABOUTME: Optimized Dashboard with parallel loading and error boundaries - no UI changes
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { useStableAuth } from '@/hooks/useStableAuth';
import { DataErrorBoundary } from '@/components/error/DataErrorBoundary';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { HeroSection } from '@/components/dashboard/HeroSection';
import ArticleRow from '@/components/dashboard/ArticleRow';
import { UpcomingReleaseCard } from '@/components/dashboard/UpcomingReleaseCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  const { 
    issues, 
    sectionVisibility, 
    reviewerComments, 
    featuredIssue, 
    isLoading: dataLoading, 
    errors,
    retryFailed 
  } = useParallelDataLoader();

  console.log('Dashboard: Rendering with', issues?.length || 0, 'issues');

  // Show skeleton only while essential data is loading
  const isInitialLoading = authLoading || (dataLoading && issues.length === 0);

  if (isInitialLoading) {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Show error state if critical data failed to load
  if (Object.keys(errors).length > 0 && issues.length === 0) {
    return (
      <DataErrorBoundary context="dashboard data" onRetry={retryFailed}>
        <div className="w-full min-h-screen" style={{ backgroundColor: '#121212' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4 text-white">Erro ao carregar conteúdo</h2>
              <p className="text-gray-400 mb-4">
                Não foi possível carregar os dados do dashboard.
              </p>
              <button 
                onClick={retryFailed}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </DataErrorBoundary>
    );
  }

  // Show empty state if no content available
  if (issues.length === 0) {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4 text-white">Nenhum conteúdo disponível</h2>
            <p className="text-gray-400">
              Aguarde novos conteúdos serem publicados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out featured issue from other sections to avoid duplication
  const nonFeaturedIssues = featuredIssue 
    ? issues.filter(issue => issue.id !== featuredIssue.id)
    : issues;
  
  // Organize issues by type for different sections
  const recentIssues = nonFeaturedIssues
    .filter(issue => issue.published)
    .slice(0, 10);
    
  const recommendedIssues = nonFeaturedIssues
    .filter(issue => issue.published)
    .slice(0, 10);
    
  const trendingIssues = nonFeaturedIssues
    .filter(issue => issue.published)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10);

  // Get enabled sections in order
  const enabledSections = sectionVisibility
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  console.log('Dashboard: Visible sections:', enabledSections.map(s => s.id));
  console.log('Dashboard: Featured issue:', featuredIssue?.id);

  const renderSection = (sectionId: string, index: number) => {
    const isReviewerSection = sectionId === 'reviews';
    const nextSection = enabledSections[index + 1];
    const isFollowedByFeatured = nextSection?.id === 'featured';
    
    switch (sectionId) {
      case 'reviews':
        return (
          <DataErrorBoundary key={`reviews-${index}`} context="reviewer comments">
            <div className={isFollowedByFeatured ? 'mb-4' : ''}>
              <ReviewerCommentsDisplay comments={reviewerComments} />
            </div>
          </DataErrorBoundary>
        );
        
      case 'reviewer':
        // Skip duplicate reviewer section
        return null;
        
      case 'featured':
        if (!featuredIssue) return null;
        return (
          <DataErrorBoundary key={`featured-${featuredIssue.id}-${index}`} context="featured issue">
            <HeroSection featuredIssue={featuredIssue} />
          </DataErrorBoundary>
        );
        
      case 'upcoming':
        return (
          <DataErrorBoundary key={`upcoming-${index}`} context="upcoming releases">
            <UpcomingReleaseCard />
          </DataErrorBoundary>
        );
        
      case 'recent':
        if (recentIssues.length === 0) return null;
        return (
          <DataErrorBoundary key={`recent-${index}`} context="recent issues">
            <ArticleRow title="Edições Recentes" articles={recentIssues} />
          </DataErrorBoundary>
        );
        
      case 'recommended':
        if (recommendedIssues.length === 0) return null;
        return (
          <DataErrorBoundary key={`recommended-${index}`} context="recommended issues">
            <ArticleRow title="Recomendados para você" articles={recommendedIssues} />
          </DataErrorBoundary>
        );
        
      case 'trending':
        if (trendingIssues.length === 0) return null;
        return (
          <DataErrorBoundary key={`trending-${index}`} context="trending issues">
            <ArticleRow title="Mais acessados" articles={trendingIssues} />
          </DataErrorBoundary>
        );
        
      default:
        return null;
    }
  };

  return (
    <DataErrorBoundary context="dashboard" onRetry={retryFailed}>
      <div className="w-full min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-8">
            {enabledSections.map((section, index) => {
              const sectionElement = renderSection(section.id, index);
              // Only render if we have a valid element
              if (!sectionElement) return null;
              return sectionElement;
            })}
          </div>
        </div>
      </div>
    </DataErrorBoundary>
  );
};

export default Dashboard;
