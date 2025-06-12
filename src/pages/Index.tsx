
// ABOUTME: Optimized landing page with dynamic section rendering and enhanced performance
import React, { useMemo } from 'react';
import { useOptimizedSectionVisibility } from '@/hooks/useOptimizedSectionVisibility';
import { SectionFactory } from '@/components/homepage/SectionFactory';

const Index = () => {
  const { getVisibleSections, isLoading } = useOptimizedSectionVisibility();

  // Memoize visible sections to prevent unnecessary re-renders
  const visibleSections = useMemo(() => {
    return getVisibleSections();
  }, [getVisibleSections]);

  // Memoize section configs to prevent object recreation
  const sectionConfigs = useMemo(() => {
    return visibleSections.map((section) => ({
      id: section.id,
      config: {
        visible: section.visible,
        order: section.order,
        title: section.title
      }
    }));
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
