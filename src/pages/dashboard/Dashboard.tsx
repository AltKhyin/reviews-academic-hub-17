
// ABOUTME: Optimized Dashboard with eliminated API calls and centralized data flow
import React from 'react';
import { useEnhancedParallelDataLoader } from '@/hooks/useEnhancedParallelDataLoader';
import { useStableAuth } from '@/hooks/useStableAuth';
import { DataErrorBoundary } from '@/components/error/DataErrorBoundary';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { HeroSection } from '@/components/dashboard/HeroSection';
import ArticleRow from '@/components/dashboard/ArticleRow';
import { UpcomingReleaseCard } from '@/components/dashboard/UpcomingReleaseCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { UserInteractionProvider } from '@/contexts/UserInteractionContext';
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  const { 
    issues, 
    sectionVisibility, 
    featuredIssue, 
    allIssueIds,
    isLoading: dataLoading, 
    errors,
    retryFailed 
  } = useEnhancedParallelDataLoader();

  // Monitor API call efficiency
  React.useEffect(() => {
    if (!dataLoading) {
      const metrics = apiCallMonitor.getMetrics();
      console.log('Dashboard API Call Metrics:', {
        totalCalls: metrics.totalCalls,
        efficiency: `${metrics.efficiency.toFixed(1)}%`,
        duplicates: metrics.duplicateCount,
        unauthorized: metrics.componentCalls
      });
    }
  }, [dataLoading]);

  console.log('Dashboard: Rendering with', issues?.length || 0, 'issues');
  console.log('Dashboard: PERFORMANCE FIX - Using enhanced loader with bulk context');

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

  // Get enabled sections in order from the unified configuration
  const enabledSections = sectionVisibility
    .filter(section => section.visible) 
    .sort((a, b) => a.order - b.order);

  console.log('Dashboard: PERFORMANCE FIX - Bulk loading interactions for', allIssueIds.length, 'issues');

  const renderSection = (sectionConfig: any, index: number) => {
    const sectionId = sectionConfig.id;
    
    switch (sectionId) {
      case 'reviewer':
        return (
          <DataErrorBoundary key={`reviewer-${index}`} context="reviewer comments">
            <ReviewerCommentsDisplay />
          </DataErrorBoundary>
        );
        
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
        console.warn(`Dashboard: Unknown section ID: ${sectionId}`);
        return null;
    }
  };

  return (
    <DataErrorBoundary context="dashboard" onRetry={retryFailed}>
      {/* PERFORMANCE FIX: Single UserInteractionProvider for ALL components */}
      <UserInteractionProvider issueIds={allIssueIds}>
        <div className="w-full min-h-screen" style={{ backgroundColor: '#121212' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-8">
              {enabledSections.length === 0 ? (
                <div className="text-center py-16">
                  <h2 className="text-2xl font-bold mb-4 text-white">Nenhuma seção configurada</h2>
                  <p className="text-gray-400">
                    Configure as seções da página inicial no painel administrativo.
                  </p>
                </div>
              ) : (
                enabledSections.map((section, index) => {
                  const sectionElement = renderSection(section, index);
                  if (!sectionElement) return null;
                  return sectionElement;
                })
              )}
            </div>
          </div>
        </div>
      </UserInteractionProvider>
    </DataErrorBoundary>
  );
};

export default Dashboard;
