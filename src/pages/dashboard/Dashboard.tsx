import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useHomepageData } from '@/hooks/useHomepageData';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';

// New magazine components
import { CoverStackHero } from '@/components/homepage/CoverStackHero';
import { EditorialRibbon } from '@/components/homepage/EditorialRibbon';
import { IssueMasonry } from '@/components/homepage/IssueMasonry';
import { MetricWidget } from '@/components/homepage/MetricWidget';
import { DiscussionTicker } from '@/components/homepage/DiscussionTicker';
import { SmartCarousel } from '@/components/homepage/SmartCarousel';
import { MiniPollBanner } from '@/components/homepage/MiniPollBanner';
import { InlineAdmonition } from '@/components/homepage/InlineAdmonition';

// Existing components for other sections
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import { UpcomingReleaseSection } from '@/components/dashboard/UpcomingReleaseSection';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile, isAdmin, isEditor, isLoading: authLoading } = useAuth();
  const { data: homepageData, isLoading: dataLoading, error: dataError } = useHomepageData();
  const isCollapsed = state === 'collapsed';
  const { isLoading: sectionsLoading, getSortedVisibleSectionIds } = useSectionVisibility();

  console.log("Dashboard render - Profile:", profile, "IsAdmin:", isAdmin, "IsEditor:", isEditor, "AuthLoading:", authLoading);
  console.log("Homepage data:", homepageData);

  // Wait for authentication and data to complete
  if (authLoading || dataLoading || sectionsLoading) {
    console.log("Dashboard: Loading...");
    return <DashboardSkeleton />;
  }

  // Show error state if data failed to load
  if (dataError) {
    console.error("Dashboard: Data loading error:", dataError);
    return (
      <div className="pt-4 pb-16">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
          <h2 className="text-red-400 text-lg font-semibold mb-2">Error Loading Content</h2>
          <p className="text-red-300 mb-4">Failed to load homepage data: {dataError.message}</p>
        </div>
      </div>
    );
  }

  const visibleSectionIds = getSortedVisibleSectionIds();
  console.log("Dashboard: Visible section IDs:", visibleSectionIds);

  // Enhanced debug info for admin
  if ((isAdmin || isEditor) && homepageData) {
    console.log("Dashboard: Admin data debug", {
      featuredIssue: !!homepageData.featuredIssue,
      recentIssues: homepageData.recentIssues.length,
      recommendedIssues: homepageData.recommendedIssues.length,
      hasTagline: !!homepageData.editorialTagline,
      hasActivePoll: !!homepageData.activePoll,
      topThreads: homepageData.topThreads.length
    });
  }

  // Mock poll data for MiniPollBanner (replace with real data later)
  const mockPoll = homepageData?.activePoll ? {
    id: homepageData.activePoll.id,
    question: homepageData.activePoll.question,
    options: homepageData.activePoll.options || [],
    totalVotes: homepageData.activePoll.votes?.reduce((sum: number, vote: number) => sum + vote, 0) || 0,
    closesAt: homepageData.activePoll.closes_at,
    userHasVoted: false // This should come from user data
  } : null;

  // Component mapping for each section type
  const renderSection = (sectionId: string) => {
    console.log(`Rendering section: ${sectionId}`);
    
    switch(sectionId) {
      case 'featured':
        return homepageData?.featuredIssue ? (
          <CoverStackHero key="featured" issue={homepageData.featuredIssue} />
        ) : null;
        
      case 'recent':
        return (
          <div key="recent" className="magazine-grid">
            <div className="col-span-12 lg:col-span-8">
              <IssueMasonry 
                issues={homepageData?.recentIssues || []} 
                isLoading={dataLoading}
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <MetricWidget nextIssueDate={homepageData?.nextIssueDate} />
            </div>
          </div>
        );
        
      case 'reviews':
        return (
          <div key="reviews" className="max-w-magazine mx-auto px-6 mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-6">Reviews do Editor</h2>
            {(isAdmin || isEditor) ? (
              <ReviewerCommentSection />
            ) : (
              <div className="magazine-card p-6">
                <p className="text-muted-foreground text-center">
                  Aguarde novos reviews e comentários da equipe editorial.
                </p>
              </div>
            )}
          </div>
        );
        
      case 'reviewer':
        return (
          <div key="reviewer" className="max-w-magazine mx-auto px-6 mb-8">
            <ReviewerCommentsDisplay />
          </div>
        );
        
      case 'upcoming':
        return (
          <div key="upcoming" className="max-w-magazine mx-auto px-6 mb-8">
            <UpcomingReleaseSection />
          </div>
        );
        
      case 'recommended':
        return (
          <SmartCarousel
            key="recommended"
            title="Recomendados para Você"
            issues={homepageData?.recommendedIssues || []}
            kind="recommended"
            isLoading={dataLoading}
            className="mb-8"
          />
        );
        
      case 'trending':
        return (
          <SmartCarousel
            key="trending"
            title="Mais Acessados"
            issues={homepageData?.trendingIssues || []}
            kind="popular"
            isLoading={dataLoading}
            className="mb-8"
          />
        );
        
      default:
        console.warn(`Unknown section type: ${sectionId}`);
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-canvas transition-all duration-300 ${isCollapsed ? '' : 'lg:pl-4'}`}>
      {/* Enhanced debug info for admin */}
      {(isAdmin || isEditor) && (
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4 mb-4 max-w-magazine mx-auto">
          <p className="text-green-400 text-sm">
            🔧 Admin Mode: Magazine Layout Active
            Role: {profile?.role} | IsAdmin: {isAdmin ? 'Yes' : 'No'} | IsEditor: {isEditor ? 'Yes' : 'No'}
          </p>
          <p className="text-green-400 text-xs mt-1">
            Visible sections: {visibleSectionIds.join(', ')}
          </p>
        </div>
      )}

      {/* Editorial Ribbon */}
      {homepageData?.editorialTagline && (
        <EditorialRibbon tagline={homepageData.editorialTagline} />
      )}

      {/* Main Content */}
      <main className="space-y-12 pb-16">
        {/* Render sections in order */}
        {visibleSectionIds.map(renderSection)}
        
        {/* Discussion Ticker */}
        {homepageData?.topThreads && homepageData.topThreads.length > 0 && (
          <DiscussionTicker 
            threads={homepageData.topThreads}
            isLoading={dataLoading}
          />
        )}
        
        {/* Mini Poll Banner */}
        {mockPoll && (
          <MiniPollBanner 
            poll={mockPoll}
            onVote={(optionId) => console.log('Vote:', optionId)}
            isLoading={dataLoading}
          />
        )}
        
        {/* Pre-print disclaimer example */}
        {homepageData?.featuredIssue && (
          <div className="max-w-magazine mx-auto px-6">
            <InlineAdmonition type="warning" title="Aviso Importante">
              <p>
                Este conteúdo é baseado em artigos científicos em pré-publicação. 
                As informações podem estar sujeitas a revisões antes da publicação final.
              </p>
            </InlineAdmonition>
          </div>
        )}
        
        {/* Fallback if no content */}
        {(!homepageData?.featuredIssue && (!homepageData?.recentIssues || homepageData.recentIssues.length === 0)) && (
          <div className="max-w-magazine mx-auto px-6 text-center py-12">
            <h2 className="text-xl font-serif font-medium mb-2">
              Nenhum conteúdo disponível
            </h2>
            <p className="text-muted-foreground">
              {profile?.role === 'admin' || profile?.role === 'editor'
                ? 'Crie seu primeiro artigo para começar.'
                : 'Volte em breve para novos artigos.'}
            </p>
            {(isAdmin || isEditor) && (
              <button
                onClick={() => window.location.href = '/edit'}
                className="mt-4 bg-accent-blue-400 hover:bg-accent-blue-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ir para Painel Administrativo
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
