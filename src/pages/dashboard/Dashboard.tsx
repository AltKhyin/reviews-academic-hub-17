
// ABOUTME: Enhanced Dashboard page using SharedDataProvider to prevent API cascade
import React, { useMemo } from 'react';
import { useSharedData } from '@/contexts/SharedDataProvider';
import { HeroSection } from '@/components/dashboard/HeroSection';
import ArticleRow from '@/components/dashboard/ArticleRow';
import { useOptimizedUserInteractions } from '@/hooks/useOptimizedUserInteractions';

// Type definitions for safe JSON parsing
interface SectionVisibilityItem {
  id: string;
  visible: boolean;
  order?: number;
  title?: string;
}

const Dashboard = () => {
  const { issues, featuredIssue, reviewerComments, sectionVisibility, isLoading, error } = useSharedData();
  const { userInteractions } = useOptimizedUserInteractions();

  console.log('Dashboard: Rendering with', issues.length, 'issues');
  console.log('Dashboard: Section visibility config:', sectionVisibility);

  // FIXED: Always call useMemo hooks in the same order, regardless of data state
  const visibleSections = useMemo(() => {
    if (!Array.isArray(sectionVisibility)) {
      console.warn('Dashboard: sectionVisibility is not an array:', typeof sectionVisibility, sectionVisibility);
      return [];
    }

    const filtered = sectionVisibility
      .filter((section: any): section is SectionVisibilityItem => {
        if (!section || typeof section !== 'object') {
          console.warn('Dashboard: Invalid section object:', section);
          return false;
        }
        
        if (!section.id || typeof section.id !== 'string') {
          console.warn('Dashboard: Section missing or invalid id:', section);
          return false;
        }
        return section.visible === true;
      })
      .map((section: any): SectionVisibilityItem => ({
        id: section.id,
        visible: section.visible,
        order: typeof section.order === 'number' ? section.order : 0,
        title: typeof section.title === 'string' ? section.title : undefined,
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log('Dashboard: Visible sections from unified config:', filtered.map(s => `${s.id} (order: ${s.order})`));
    return filtered;
  }, [sectionVisibility]);

  // FIXED: Always call this useMemo hook regardless of issues length
  const articlesWithUserData = useMemo(() => {
    if (!Array.isArray(issues)) {
      return [];
    }
    
    return issues.map(article => ({
      ...article,
      userInteractionData: {
        isBookmarked: userInteractions.bookmarks.has(article.id),
        hasWantMoreReaction: userInteractions.reactions[article.id]?.includes('want_more') || false
      }
    }));
  }, [issues, userInteractions]);

  // FIXED: Always call this useMemo hook regardless of other conditions
  const sectionedArticles = useMemo(() => {
    const sections: Record<string, any[]> = {};
    
    visibleSections.forEach(section => {
      switch (section.id) {
        case 'featured':
          if (featuredIssue) {
            sections.featured = [{
              ...featuredIssue,
              userInteractionData: {
                isBookmarked: userInteractions.bookmarks.has(featuredIssue.id),
                hasWantMoreReaction: userInteractions.reactions[featuredIssue.id]?.includes('want_more') || false
              }
            }];
          }
          break;
        case 'recent':
          sections.recent = articlesWithUserData.slice(0, 5);
          break;
        case 'upcoming':
          sections.upcoming = articlesWithUserData.filter(a => new Date(a.published_at) > new Date()).slice(0, 5);
          break;
        case 'recommended':
          sections.recommended = articlesWithUserData.filter(a => a.score > 50).slice(0, 5);
          break;
        case 'trending':
          sections.trending = articlesWithUserData.sort((a, b) => b.score - a.score).slice(0, 5);
          break;
      }
    });
    
    return sections;
  }, [visibleSections, articlesWithUserData, featuredIssue, userInteractions]);

  // FIXED: No early returns before all hooks are called
  // Handle loading state after all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando página inicial...</p>
        </div>
      </div>
    );
  }

  // Handle error state after all hooks are called
  if (error) {
    console.error('Dashboard: Error loading data:', error);
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar conteúdo</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados da página inicial.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Featured issue:', featuredIssue?.id || 'none');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {visibleSections.length > 0 ? (
          <div className="space-y-12">
            {visibleSections.map((section) => {
              console.log('Dashboard: Rendering section', section.id);
              
              // Render featured section as hero
              if (section.id === 'featured' && sectionedArticles.featured?.[0]) {
                return (
                  <HeroSection 
                    key={section.id}
                    featuredIssue={sectionedArticles.featured[0]}
                  />
                );
              }
              
              // Render other sections as article rows
              const sectionArticles = sectionedArticles[section.id];
              if (sectionArticles && sectionArticles.length > 0) {
                return (
                  <ArticleRow
                    key={section.id}
                    title={section.title || section.id}
                    articles={sectionArticles}
                    variant={section.id === 'featured' ? 'featured' : 'default'}
                  />
                );
              }
              
              return null;
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Configuração da página inicial</h1>
              <p className="text-gray-600 mb-4">
                As seções da página inicial estão sendo configuradas.
              </p>
              <p className="text-sm text-gray-500">
                Configure as seções no painel administrativo para personalizar esta página.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
