
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

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile, isAdmin, isEditor, isLoading: authLoading } = useAuth();
  const { data: issues = [], isLoading: issuesLoading, refetch } = useIssues();
  const isCollapsed = state === 'collapsed';
  const { isLoading: sectionsLoading, getSortedVisibleSectionIds, isSectionVisible } = useSectionVisibility();

  console.log("Dashboard render - Profile:", profile, "IsAdmin:", isAdmin, "IsEditor:", isEditor, "AuthLoading:", authLoading);

  // Wait for authentication to complete before making decisions
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  const visibleIssues = React.useMemo(() => {
    if (!issues) return [];
    
    console.log("Processing issues:", issues.length, "User role:", profile?.role, "IsAdmin:", isAdmin, "IsEditor:", isEditor);
    
    // For admin and editor users, show ALL issues (published and unpublished)
    if (isAdmin || isEditor || profile?.role === 'admin' || profile?.role === 'editor') {
      console.log("Admin/Editor view - showing all issues");
      return issues;
    }
    
    // For regular users, only show published issues
    console.log("Regular user view - showing only published issues");
    return issues.filter(issue => issue.published);
  }, [issues, profile, isAdmin, isEditor]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  // Component mapping for each section type
  const renderSection = (sectionId: string) => {
    switch(sectionId) {
      case 'reviews':
        // Show both reviewer comment section (for adding) and display (for viewing)
        return (
          <div key="reviews" className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Reviews do Editor</h2>
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
      {/* Enhanced debug info for admin */}
      {(isAdmin || isEditor) && (
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <p className="text-green-400 text-sm">
            🔧 Admin Mode: Showing {visibleIssues.length} issues (including unpublished). 
            Role: {profile?.role} | IsAdmin: {isAdmin ? 'Yes' : 'No'} | IsEditor: {isEditor ? 'Yes' : 'No'} | UserID: {user?.id}
          </p>
          <p className="text-green-400 text-xs mt-1">
            Visible sections: {visibleSectionIds.join(', ')}
          </p>
        </div>
      )}

      {issuesLoading || sectionsLoading ? (
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
