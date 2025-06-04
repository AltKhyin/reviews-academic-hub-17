
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="relative bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-12 backdrop-blur-sm text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-red-400 text-3xl font-serif font-semibold mb-4 tracking-tight">Erro ao Carregar Conteúdo</h2>
              <p className="text-red-300/80 mb-8 text-lg leading-relaxed font-light">
                Falha ao carregar edições: {issuesError.message}
              </p>
              <button 
                onClick={() => refetch()}
                className="bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 text-red-300 px-8 py-4 rounded-2xl transition-all duration-300 font-medium hover:scale-105 shadow-lg border border-red-500/30 hover:border-red-500/50"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
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
  const renderSection = (sectionId: string, index: number) => {
    console.log(`Rendering section: ${sectionId}`);
    const sectionStyle = {
      animationDelay: `${index * 200}ms`,
      animation: 'fadeInUp 0.8s ease-out forwards',
      opacity: 0
    };

    switch(sectionId) {
      case 'reviews':
        return (
          <div key="reviews" className="mb-20" style={sectionStyle}>
            <div className="mb-10">
              <h2 className="text-4xl font-serif font-semibold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                Reviews do Editor
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
            </div>
            <div className="relative bg-gradient-to-br from-blue-600/8 to-purple-600/8 border border-blue-500/15 rounded-3xl p-12 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
              <div className="relative text-center">
                <div className="flex items-center justify-center mb-8">
                  <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full shadow-inner">
                    <svg className="w-16 h-16 text-blue-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4 text-gray-200">
                  Reviews Editoriais
                </h3>
                <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto font-light">
                  Aguarde novos reviews e comentários da nossa equipe editorial especializada.
                </p>
              </div>
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
          issues={visibleIssues.slice(0, 6)} 
          featuredIssueId={featuredIssue?.id} 
          sectionTitle="Edições Recentes"
          sectionType="recent"
        />;
      case 'recommended':
        const recommended = [...visibleIssues].sort(() => Math.random() - 0.5).slice(0, 6);
        return <ArticlesSection 
          key="recommended"
          issues={recommended} 
          featuredIssueId={featuredIssue?.id} 
          sectionTitle="Recomendados para você"
          sectionType="recommended"
        />;
      case 'trending':
        const trending = [...visibleIssues].sort(() => Math.random() - 0.5).slice(0, 6);
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 transition-all duration-500 ${isCollapsed ? 'max-w-full px-8' : 'max-w-[96%] mx-auto px-12'}`}>
      <div className="pt-8 pb-32 space-y-20">
        {/* Enhanced debug info for admin */}
        {(isAdmin || isEditor) && (
          <div 
            className="relative bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-8 backdrop-blur-sm"
            style={{
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-green-400 font-semibold">Modo Administrador</span>
              </div>
              <p className="text-green-400/90 text-base font-medium leading-relaxed">
                🔧 Exibindo {visibleIssues.length} de {issues.length} edições totais. 
                Papel: <span className="font-bold">{profile?.role}</span> | 
                IsAdmin: <span className="font-bold">{isAdmin ? 'Sim' : 'Não'}</span> | 
                IsEditor: <span className="font-bold">{isEditor ? 'Sim' : 'Não'}</span>
              </p>
              <p className="text-green-400/70 text-sm mt-3">
                Seções visíveis: {visibleSectionIds.join(', ')}
              </p>
              <p className="text-green-400/70 text-sm mt-1">
                Status de carregamento: Edições {issuesLoading ? '⏳' : '✅'} | Seções {sectionsLoading ? '⏳' : '✅'}
              </p>
            </div>
          </div>
        )}

        {issuesLoading || sectionsLoading ? (
          <DashboardSkeleton />
        ) : visibleIssues.length > 0 ? (
          <>
            {visibleSectionIds.map((sectionId, index) => renderSection(sectionId, index))}
          </>
        ) : (
          <div 
            className="min-h-screen flex items-center justify-center"
            style={{
              animation: 'fadeInUp 0.8s ease-out forwards'
            }}
          >
            <div className="max-w-3xl w-full text-center px-6">
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-3xl p-16 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/10 to-gray-800/10 rounded-3xl"></div>
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-serif font-medium mb-6 tracking-tight text-gray-200">
                    {issues.length === 0 ? 'Biblioteca em Preparação' : 'Conteúdo em Curadoria'}
                  </h2>
                  <p className="text-gray-400 text-xl leading-relaxed mb-12 font-light">
                    {profile?.role === 'admin' || profile?.role === 'editor'
                      ? issues.length === 0 
                        ? 'Inicie sua jornada editorial criando o primeiro artigo da plataforma.'
                        : `Você possui ${issues.length} artigos em desenvolvimento. Publique-os para torná-los visíveis aos leitores.`
                      : 'Nossa equipe está preparando novos conteúdos excepcionais. Retorne em breve para descobrir as últimas publicações.'}
                  </p>
                  {(isAdmin || isEditor) && (
                    <button
                      onClick={() => window.location.href = '/edit'}
                      className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl transition-all duration-300 font-medium text-lg hover:scale-105 shadow-xl shadow-blue-600/25 hover:shadow-purple-600/25 border border-blue-500/20 hover:border-purple-500/30"
                    >
                      <span className="flex items-center">
                        Acessar Painel Editorial
                        <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
