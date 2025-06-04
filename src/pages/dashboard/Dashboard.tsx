
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';
import { UpcomingReleaseSection } from '@/components/dashboard/UpcomingReleaseSection';
import { ReviewerCommentsDisplay } from '@/components/dashboard/ReviewerCommentsDisplay';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { CoverStackHero } from '@/components/homepage/CoverStackHero';
import { SmartCarousel } from '@/components/homepage/SmartCarousel';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile, isAdmin, isEditor, isLoading: authLoading } = useAuth();
  const { data: issues = [], isLoading: issuesLoading, error: issuesError, refetch } = useIssues();
  const isCollapsed = state === 'collapsed';
  const { isLoading: sectionsLoading, getSortedVisibleSectionIds, isSectionVisible } = useSectionVisibility();

  console.log("Dashboard render - Profile:", profile, "IsAdmin:", isAdmin, "IsEditor:", isEditor, "AuthLoading:", authLoading);
  console.log("Dashboard - Issues data:", { 
    issuesCount: issues?.length || 0, 
    issuesLoading, 
    issuesError: issuesError?.message,
    firstIssue: issues?.[0] ? {
      id: issues[0].id,
      title: issues[0].title,
      published: issues[0].published
    } : null
  });

  // Wait for authentication to complete before making decisions
  if (authLoading) {
    console.log("Dashboard: Auth still loading...");
    return <DashboardSkeleton />;
  }

  // Show error state if issues failed to load
  if (issuesError) {
    console.error("Dashboard: Issues loading error:", issuesError);
    return (
      <div className="pt-4 pb-16">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
          <h2 className="text-red-400 text-lg font-semibold mb-2">Error Loading Content</h2>
          <p className="text-red-300 mb-4">Failed to load issues: {issuesError.message}</p>
          <button 
            onClick={() => refetch()}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const visibleIssues = React.useMemo(() => {
    if (!issues || issues.length === 0) {
      console.log("Dashboard: No issues available");
      return [];
    }
    
    console.log("Processing issues:", issues.length, "User role:", profile?.role, "IsAdmin:", isAdmin, "IsEditor:", isEditor);
    
    // For admin and editor users, show ALL issues (published and unpublished)
    if (isAdmin || isEditor || profile?.role === 'admin' || profile?.role === 'editor') {
      console.log("Admin/Editor view - showing all issues");
      return issues;
    }
    
    // For regular users, only show published issues
    console.log("Regular user view - showing only published issues");
    const publishedIssues = issues.filter(issue => issue.published);
    console.log(`Filtered to ${publishedIssues.length} published issues`);
    return publishedIssues;
  }, [issues, profile, isAdmin, isEditor]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  // Component mapping for each section type
  const renderSection = (sectionId: string) => {
    console.log(`Rendering section: ${sectionId}`);
    switch(sectionId) {
      case 'hero':
        return <CoverStackHero key="hero" issues={visibleIssues} />;
      
      case 'reviews':
        // Show both reviewer comment section (for adding) and display (for viewing)
        return (
          <div key="reviews" className="section-spacing">
            <h2 className="font-journal text-journal-heading text-journal-primary mb-6">Reviews do Editor</h2>
            {(isAdmin || isEditor) ? (
              <ReviewerCommentSection />
            ) : (
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
                <p className="text-gray-300">
                  Aguarde novos reviews e comentários da equipe editorial.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'reviewer':
        return <ReviewerCommentsDisplay key="reviewer" />;
      
      case 'featured':
        return <FeaturedSection key="featured" issues={visibleIssues} />;
      
      case 'upcoming':
        return <UpcomingReleaseSection key="upcoming" />;
      
      case 'recent':
        return <SmartCarousel 
          key="recent"
          title="Edições Recentes"
          issues={visibleIssues.slice(0, 8)} 
          featuredIssueId={featuredIssue?.id}
        />;
      
      case 'recommended':
        const recommended = [...visibleIssues].sort(() => Math.random() - 0.5).slice(0, 8);
        return <SmartCarousel 
          key="recommended"
          title="Recomendados para você"
          issues={recommended} 
          featuredIssueId={featuredIssue?.id}
        />;
      
      case 'trending':
        const trending = [...visibleIssues].sort(() => Math.random() - 0.5).slice(0, 8);
        return <SmartCarousel 
          key="trending"
          title="Mais Acessados"
          issues={trending} 
          featuredIssueId={featuredIssue?.id}
        />;
      
      default:
        console.warn(`Unknown section type: ${sectionId}`);
        return null;
    }
  };

  const visibleSectionIds = getSortedVisibleSectionIds();
  console.log("Dashboard: Visible section IDs:", visibleSectionIds);

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'} pt-6 pb-16`}>
      {/* Enhanced debug info for admin */}
      {(isAdmin || isEditor) && (
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <p className="text-green-400 text-sm">
            🔧 Admin Mode: Showing {visibleIssues.length} of {issues.length} total issues. 
            Role: {profile?.role} | IsAdmin: {isAdmin ? 'Yes' : 'No'} | IsEditor: {isEditor ? 'Yes' : 'No'} | UserID: {user?.id}
          </p>
          <p className="text-green-400 text-xs mt-1">
            Visible sections: {visibleSectionIds.join(', ')}
          </p>
          <p className="text-green-400 text-xs mt-1">
            Issues loading: {issuesLoading ? 'Yes' : 'No'} | Sections loading: {sectionsLoading ? 'Yes' : 'No'}
          </p>
        </div>
      )}

      {issuesLoading || sectionsLoading ? (
        <DashboardSkeleton />
      ) : visibleIssues.length > 0 ? (
        <div className="space-y-0">
          {visibleSectionIds.map(renderSection)}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="hero-gradient scientific-grid rounded-2xl p-12 max-w-2xl mx-auto">
            <h2 className="font-journal text-journal-heading text-journal-primary mb-4">
              {issues.length === 0 ? 'Nenhum artigo disponível' : 'Nenhum artigo publicado disponível'}
            </h2>
            <p className="journal-body text-journal-secondary mb-6">
              {profile?.role === 'admin' || profile?.role === 'editor'
                ? issues.length === 0 
                  ? 'Crie seu primeiro artigo para começar.'
                  : `Você tem ${issues.length} artigos não publicados. Publique alguns para torná-los visíveis aos usuários.`
                : 'Volte mais tarde para novos artigos.'}
            </p>
            {(isAdmin || isEditor) && (
              <button
                onClick={() => window.location.href = '/edit'}
                className="bg-journal-primary text-white px-6 py-3 rounded-lg hover:bg-journal-secondary transition-colors font-medium"
              >
                Ir para Painel Admin
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
