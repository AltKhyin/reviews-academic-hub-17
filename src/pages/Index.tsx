
// ABOUTME: Enhanced landing page with optimized data loading to prevent API cascades
import React, { useMemo } from 'react';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';
import { SectionFactory } from '@/components/homepage/SectionFactory';
import { getSectionById } from '@/config/sections';

// Type definitions for safe JSON parsing
interface SectionVisibilityItem {
  id: string;
  visible: boolean;
  order?: number;
  title?: string;
}

const Index = () => {
  const { 
    data: homepageData,
    isLoading, 
    error,
    refetch
  } = useOptimizedHomepage();

  console.log('Index page render - Optimized data loading:', {
    issuesCount: homepageData?.issues?.length || 0,
    sectionVisibilityType: typeof homepageData?.sectionVisibility,
    sectionVisibilityLength: Array.isArray(homepageData?.sectionVisibility) 
      ? homepageData.sectionVisibility.length 
      : 'not array',
    featuredIssue: homepageData?.featuredIssue?.id || 'none',
    reviewerCommentsCount: homepageData?.reviewerComments?.length || 0,
    isLoading,
    hasErrors: !!error
  });

  // Enhanced memoization with comprehensive validation and safe type casting
  const visibleSections = useMemo(() => {
    const sectionVisibility = homepageData?.sectionVisibility;
    
    if (!Array.isArray(sectionVisibility)) {
      console.warn('Index: sectionVisibility is not an array:', typeof sectionVisibility, sectionVisibility);
      return [];
    }
    
    const filtered = sectionVisibility
      .filter((section): section is SectionVisibilityItem => {
        if (!section || typeof section !== 'object') {
          console.warn('Index: Invalid section object:', section);
          return false;
        }
        
        // Safe type casting with validation
        const typedSection = section as any;
        if (!typedSection.id || typeof typedSection.id !== 'string') {
          console.warn('Index: Section missing or invalid id:', section);
          return false;
        }
        return typedSection.visible === true;
      })
      .map((section): SectionVisibilityItem => {
        const typedSection = section as any;
        return {
          id: typedSection.id,
          visible: typedSection.visible,
          order: typeof typedSection.order === 'number' ? typedSection.order : 0,
          title: typeof typedSection.title === 'string' ? typedSection.title : undefined,
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('Index: Processed visible sections:', filtered);
    return filtered;
  }, [homepageData?.sectionVisibility]);

  // Enhanced section configs with comprehensive error handling
  const sectionConfigs = useMemo(() => {
    const configs = visibleSections.map((section) => {
      const sectionDefinition = getSectionById(section.id);
      if (!sectionDefinition) {
        console.warn(`Index: No definition found for section: ${section.id}`);
      }
      
      return {
        id: section.id,
        config: {
          visible: section.visible,
          order: section.order || 0,
          title: sectionDefinition?.title || section.title || section.id
        }
      };
    });
    
    console.log('Index: Generated section configs:', configs);
    return configs;
  }, [visibleSections]);

  // Enhanced content validation with safe type checking
  const hasContent = useMemo(() => {
    const issues = homepageData?.issues;
    const featuredIssue = homepageData?.featuredIssue;
    const reviewerComments = homepageData?.reviewerComments;
    const sectionVisibility = homepageData?.sectionVisibility;
    
    const contentCheck = {
      hasIssues: Array.isArray(issues) && issues.length > 0,
      hasFeaturedIssue: !!featuredIssue,
      hasReviewerComments: Array.isArray(reviewerComments) && reviewerComments.length > 0,
      hasVisibleSections: Array.isArray(sectionVisibility) && sectionVisibility.some((s: any) => s?.visible === true)
    };
    
    const result = contentCheck.hasIssues || contentCheck.hasFeaturedIssue || contentCheck.hasReviewerComments || contentCheck.hasVisibleSections;
    
    console.log('Index: Content check:', contentCheck, 'hasContent:', result);
    return result;
  }, [homepageData]);

  // Enhanced loading state
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

  // Enhanced error state with detailed information
  if (error && !hasContent) {
    console.error('Index: Critical error with no content fallback:', error);
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar conteúdo</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados da página inicial.
            </p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600">Detalhes técnicos</summary>
                <pre className="mt-2 p-4 bg-gray-800 text-white text-xs rounded overflow-auto">
                  {JSON.stringify({ error, homepageData }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced no content state with better debugging
  if (!hasContent && sectionConfigs.length === 0) {
    console.warn('Index: No content and no section configs. State:', {
      issues: homepageData?.issues?.length,
      sectionVisibility: homepageData?.sectionVisibility?.length,
      visibleSections: visibleSections?.length,
      sectionConfigs: sectionConfigs?.length
    });
    
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Página inicial em configuração</h2>
            <p className="text-gray-600 mb-4">
              O conteúdo da página inicial está sendo configurado.
            </p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Recarregar
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-800 text-white text-xs rounded text-left">
                <p>Debug Info:</p>
                <p>Issues: {homepageData?.issues?.length || 0}</p>
                <p>Section Visibility: {Array.isArray(homepageData?.sectionVisibility) ? homepageData.sectionVisibility.length : 'not array'}</p>
                <p>Visible Sections: {visibleSections?.length || 0}</p>
                <p>Section Configs: {sectionConfigs?.length || 0}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log('Index: Rendering homepage with sections:', sectionConfigs.map(s => `${s.id} (${s.config.title})`));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {sectionConfigs.length > 0 ? (
          <div className="space-y-12">
            {sectionConfigs.map(({ id, config }) => (
              <SectionFactory
                key={`${id}-${config.order}`}
                sectionId={id}
                sectionConfig={config}
              />
            ))}
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

export default Index;
