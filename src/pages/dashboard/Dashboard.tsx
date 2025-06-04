
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
      <div className="pt-8 pb-24">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 mb-6 backdrop-blur-sm">
          <h2 className="text-red-400 text-xl font-serif font-semibold mb-3 tracking-tight">Erro ao Carregar Conteúdo</h2>
          <p className="text-red-300 mb-6 text-base leading-relaxed">Falha ao carregar edições: {issuesError.message}</p>
          <button 
            onClick={() => refetch()}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105"
          >
            Tentar Novamente
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
      case 'reviews':
        // Show only display for viewing (editing moved to /edit page)
        return (
          <div key="reviews" className="mb-12">
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-semibold mb-2 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Reviews do Editor
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/10 rounded-2xl p-8 backdrop-blur-sm">
              <p className="text-gray-300 text-lg leading-relaxed">
                Aguarde novos reviews e comentários da equipe editorial.
              </p>
            </div>
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
        console.warn(`Unknown section type: ${sectionId}`);
        return null;
    }
  };

  const visibleSectionIds = getSortedVisibleSectionIds();
  console.log("Dashboard: Visible section IDs:", visibleSectionIds);

  return (
    <div className={`pt-6 pb-24 space-y-16 transition-all duration-300 ${isCollapsed ? 'max-w-full px-6' : 'max-w-[96%] mx-auto px-8'}`}>
      {/* Enhanced debug info for admin */}
      {(isAdmin || isEditor) && (
        <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <p className="text-green-400 text-sm font-medium leading-relaxed">
            🔧 Modo Admin: Exibindo {visibleIssues.length} de {issues.length} edições totais. 
            Papel: {profile?.role} | IsAdmin: {isAdmin ? 'Sim' : 'Não'} | IsEditor: {isEditor ? 'Sim' : 'Não'} | UserID: {user?.id}
          </p>
          <p className="text-green-400 text-xs mt-2 opacity-80">
            Seções visíveis: {visibleSectionIds.join(', ')}
          </p>
          <p className="text-green-400 text-xs mt-1 opacity-80">
            Carregando edições: {issuesLoading ? 'Sim' : 'Não'} | Carregando seções: {sectionsLoading ? 'Sim' : 'Não'}
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
        <div className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-medium mb-4 tracking-tight">
              {issues.length === 0 ? 'Nenhum artigo disponível' : 'Nenhum artigo publicado disponível'}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {profile?.role === 'admin' || profile?.role === 'editor'
                ? issues.length === 0 
                  ? 'Crie seu primeiro artigo para começar.'
                  : `Você tem ${issues.length} artigos não publicados. Publique alguns para torná-los visíveis aos usuários.`
                : 'Volte mais tarde para novos artigos.'}
            </p>
            {(isAdmin || isEditor) && (
              <button
                onClick={() => window.location.href = '/edit'}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium text-lg hover:scale-105 shadow-lg"
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
