
// ABOUTME: Optimized Dashboard with coordinated data loading and standardized access patterns
import React, { useEffect } from 'react';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { useStableAuth } from '@/hooks/useStableAuth';
import { DataErrorBoundary } from '@/components/error/DataErrorBoundary';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { HeroSection } from '@/components/dashboard/HeroSection';
import ArticleRow from '@/components/dashboard/ArticleRow';
import { UpcomingReleaseCard } from '@/components/dashboard/UpcomingReleaseCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { UserInteractionProvider } from '@/contexts/UserInteractionContext';
import { ComponentAuditor } from '@/utils/componentAudit';
import { architecturalGuards } from '@/core/ArchitecturalGuards';

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  
  // ARCHITECTURAL FIX: Use standardized coordinated data access
  const { 
    data: pageData, 
    loading: dataLoading, 
    error,
    refetch 
  } = useStandardizedData.usePageData('/homepage');

  // PERFORMANCE MONITORING: Track API calls and violations
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Audit this component for architectural compliance
      ComponentAuditor.auditComponent('Dashboard', false, false);
      
      // Report coordination success
      console.log(`🏠 Dashboard: Coordinated loading with ${pageData?.contentData?.issues?.length || 0} issues`);
      
      // Check for architectural violations
      const violations = architecturalGuards.flagArchitecturalViolations();
      if (violations.length > 0) {
        console.warn('🚨 Dashboard: Architectural violations detected:', violations);
      }
    }
  }, [pageData?.contentData?.issues?.length]);

  // Extract data from coordinated page load
  const issues = pageData?.contentData?.issues || [];
  const sectionVisibility = pageData?.configData?.sectionVisibility || [];
  const featuredIssue = pageData?.contentData?.featuredIssue || null;

  console.log('Dashboard: Rendering with coordinated data:', {
    issuesCount: issues.length,
    sectionsCount: sectionVisibility.length,
    featuredIssue: featuredIssue?.id
  });

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
  if (error && issues.length === 0) {
    return (
      <DataErrorBoundary context="dashboard data" onRetry={refetch}>
        <div className="w-full min-h-screen" style={{ backgroundColor: '#121212' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4 text-white">Erro ao carregar conteúdo</h2>
              <p className="text-gray-400 mb-4">
                Não foi possível carregar os dados do dashboard.
              </p>
              <button 
                onClick={refetch}
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

  // PERFORMANCE FIX: Extract all issue IDs for bulk user interaction loading
  const allIssueIds = issues.map(issue => issue.id);

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

  console.log('Dashboard: Coordinated data loading successful:', {
    visibleSections: enabledSections.map(s => `${s.id} (order: ${s.order})`),
    featuredIssue: featuredIssue?.id,
    bulkInteractionIssues: allIssueIds.length
  });

  const renderSection = (sectionConfig: any, index: number) => {
    const sectionId = sectionConfig.id;
    const nextSection = enabledSections[index + 1];
    const isFollowedByFeatured = nextSection?.id === 'featured';
    
    console.log(`Dashboard: Rendering coordinated section ${sectionId}`);
    
    switch (sectionId) {
      case 'reviewer':
        return (
          <DataErrorBoundary key={`reviewer-${index}`} context="reviewer comments">
            <div className={isFollowedByFeatured ? 'mb-4' : ''}>
              <ReviewerCommentsDisplay />
            </div>
          </DataErrorBoundary>
        );
        
      case 'featured':
        if (!featuredIssue) {
          console.log('Dashboard: No featured issue available for featured section');
          return null;
        }
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
        if (recentIssues.length === 0) {
          console.log('Dashboard: No recent issues available');
          return null;
        }
        return (
          <DataErrorBoundary key={`recent-${index}`} context="recent issues">
            <ArticleRow title="Edições Recentes" articles={recentIssues} />
          </DataErrorBoundary>
        );
        
      case 'recommended':
        if (recommendedIssues.length === 0) {
          console.log('Dashboard: No recommended issues available');
          return null;
        }
        return (
          <DataErrorBoundary key={`recommended-${index}`} context="recommended issues">
            <ArticleRow title="Recomendados para você" articles={recommendedIssues} />
          </DataErrorBoundary>
        );
        
      case 'trending':
        if (trendingIssues.length === 0) {
          console.log('Dashboard: No trending issues available');
          return null;
        }
        return (
          <DataErrorBoundary key={`trending-${index}`} context="trending issues">
            <ArticleRow title="Mais acessados" articles={trendingIssues} />
          </DataErrorBoundary>
        );
        
      default:
        console.warn(`Dashboard: Unknown section ID: ${sectionId}`);
        return (
          <div key={`unknown-${sectionId}-${index}`} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-400">
              Seção desconhecida: {sectionId}. Verifique a configuração.
            </p>
          </div>
        );
    }
  };

  return (
    <DataErrorBoundary context="dashboard" onRetry={refetch}>
      {/* PERFORMANCE FIX: Wrap entire dashboard with UserInteractionProvider for bulk loading */}
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
                  // Only render if we have a valid element
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
