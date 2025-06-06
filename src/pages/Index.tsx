
// ABOUTME: Landing page with consistent color system
// Uses app color system for proper visual identity

import React from 'react';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { PageLayoutContainer } from '@/components/layout/LayoutContainer';
import { SectionFactory } from '@/components/homepage/SectionFactory';
import { CSS_VARIABLES } from '@/utils/colorSystem';

const Index = () => {
  const { config, isLoading, getOrderedVisibleSections } = useLayoutConfig();

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: CSS_VARIABLES.PRIMARY_BG }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" style={{ borderColor: '#3b82f6' }}></div>
          <p className="mt-4" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>Carregando página...</p>
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
      className=""
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
            <h1 className="text-2xl font-bold mb-4" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
              Nenhuma seção visível
            </h1>
            <p style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
              Configure as seções da página inicial no painel administrativo.
            </p>
          </div>
        </div>
      )}
    </PageLayoutContainer>
  );
};

export default Index;
