
// ABOUTME: Optimized landing page with dynamic section rendering and enhanced performance
import React, { useMemo } from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { SectionFactory } from '@/components/homepage/SectionFactory';
import { getSectionById } from '@/config/sections';

const Index = () => {
  const { 
    issues, 
    sectionVisibility, 
    featuredIssue, 
    isLoading, 
    errors,
    retryFailed 
  } = useParallelDataLoader();

  console.log('Index page render - Issues:', issues?.length || 0);
  console.log('Index page render - Section visibility:', sectionVisibility);
  console.log('Index page render - Featured issue:', featuredIssue?.id);

  // Memoize visible sections to prevent unnecessary re-renders
  const visibleSections = useMemo(() => {
    return sectionVisibility
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
  }, [sectionVisibility]);

  // Memoize section configs to prevent object recreation
  const sectionConfigs = useMemo(() => {
    return visibleSections.map((section) => {
      const sectionDefinition = getSectionById(section.id);
      return {
        id: section.id,
        config: {
          visible: section.visible,
          order: section.order,
          title: sectionDefinition?.title || section.id
        }
      };
    });
  }, [visibleSections]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando página...</p>
        </div>
      </div>
    );
  }

  // Show error state if critical errors occurred
  if (Object.keys(errors).length > 0 && !issues.length && !featuredIssue) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar conteúdo</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados da página inicial.
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
    );
  }

  console.log('Index page render - Visible sections:', visibleSections.map(s => `${s.id} (order: ${s.order}, visible: ${s.visible})`));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {sectionConfigs.map(({ id, config }) => (
          <SectionFactory
            key={id}
            sectionId={id}
            sectionConfig={config}
          />
        ))}
        
        {sectionConfigs.length === 0 && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Nenhuma seção visível</h1>
              <p className="text-gray-600">
                Configure as seções da página inicial no painel administrativo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
