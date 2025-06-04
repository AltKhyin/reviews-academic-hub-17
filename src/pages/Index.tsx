
// ABOUTME: Landing page with dynamic section rendering system
// Uses layout customization system for full control over homepage layout

import React from 'react';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { PageLayoutContainer } from '@/components/layout/LayoutContainer';
import { SectionFactory } from '@/components/homepage/SectionFactory';

const Index = () => {
  const { config, isLoading, getOrderedVisibleSections } = useLayoutConfig();

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

  const visibleSections = getOrderedVisibleSections();

  console.log('Index page render - Visible sections:', visibleSections.map(s => s.id));

  return (
    <PageLayoutContainer
      globalPadding={config.globalPadding}
      globalMargin={config.globalMargin}
      globalSize={config.globalSize}
      className="bg-gray-100"
    >
      {visibleSections.map((section) => (
        <SectionFactory
          key={section.id}
          section={section}
        />
      ))}
      
      {visibleSections.length === 0 && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Nenhuma seção visível</h1>
            <p className="text-gray-600">
              Configure as seções da página inicial no painel administrativo.
            </p>
          </div>
        </div>
      )}
    </PageLayoutContainer>
  );
};

export default Index;
