
// ABOUTME: Optimized Dashboard with unified section management and new optimized sections
import React, { useEffect } from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { useStableAuth } from '@/hooks/useStableAuth';
import { DataErrorBoundary } from '@/components/error/DataErrorBoundary';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { UpcomingReleaseCard } from '@/components/dashboard/UpcomingReleaseCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { UserInteractionProvider } from '@/contexts/UserInteractionContext';
import { ComponentAuditor } from '@/utils/componentAudit';
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

// Import new optimized sections
import { OptimizedRecentSection } from '@/components/homepage/sections/OptimizedRecentSection';
import { OptimizedRecommendedSection } from '@/components/homepage/sections/OptimizedRecommendedSection';

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  const { 
    issues, 
    sectionVisibility, 
    featuredIssue, 
    isLoading: dataLoading, 
    errors,
    retryFailed 
  } = useParallelDataLoader();

  // PERFORMANCE MONITORING: Track API calls and violations
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Audit this component
      ComponentAuditor.auditComponent('Dashboard', false, false);
      
      // Log initial metrics
      const totalCalls = apiCallMonitor.getTotalCallsInLastMinute();
      console.log(`🏠 Dashboard: Loaded with ${issues?.length || 0} issues, ${totalCalls} API calls in last minute`);
      
      // Set up performance monitoring interval
      const monitoringInterval = setInterval(() => {
        const currentCalls = apiCallMonitor.getTotalCallsInLastMinute();
        if (currentCalls > 15) {
          console.warn(`🚨 Dashboard: High API activity detected - ${currentCalls} calls`);
        }
      }, 10000);

      return () => clearInterval(monitoringInterval);
    }
  }, [issues?.length]);

  console.log('Dashboard: Rendering with', issues?.length || 0, 'issues');
  console.log('Dashboard: Section visibility config:', sectionVisibility);

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
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-hover"
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

  // Get enabled sections in order from the unified configuration - including new optimized sections
  const enabledSections = sectionVisibility
    .filter(section => section.visible)
    .filter(section => ['reviewer', 'featured', 'recent', 'upcoming', 'recommended'].includes(section.id))
    .sort((a, b) => a.order - b.order);

  console.log('Dashboard: Visible sections from unified config:', enabledSections.map(s => `${s.id} (order: ${s.order})`));
  console.log('Dashboard: Featured issue:', featuredIssue?.id);
  console.log('Dashboard: PERFORMANCE FIX - Bulk loading interactions for', allIssueIds.length, 'issues');

  const renderSection = (sectionConfig: any, index: number) => {
    const sectionId = sectionConfig.id;
    const nextSection = enabledSections[index + 1];
    const isFollowedByFeatured = nextSection?.id === 'featured';
    
    console.log(`Dashboard: Rendering section ${sectionId}`);
    
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
        
      case 'recent':
        return (
          <DataErrorBoundary key={`recent-${index}`} context="recent issues">
            <OptimizedRecentSection />
          </DataErrorBoundary>
        );
        
      case 'upcoming':
        return (
          <DataErrorBoundary key={`upcoming-${index}`} context="upcoming releases">
            <UpcomingReleaseCard />
          </DataErrorBoundary>
        );
        
      case 'recommended':
        return (
          <DataErrorBoundary key={`recommended-${index}`} context="recommended issues">
            <OptimizedRecommendedSection />
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
    <DataErrorBoundary context="dashboard" onRetry={retryFailed}>
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
