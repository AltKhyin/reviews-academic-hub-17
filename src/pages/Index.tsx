
// ABOUTME: Landing page with dynamic section rendering system
// Uses unified section visibility system for homepage layout control

import React from 'react';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { SectionFactory } from '@/components/homepage/SectionFactory';

const Index = () => {
  const { getVisibleSections, isLoading } = useSectionVisibility();

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

  const visibleSections = getVisibleSections();

  console.log('Index page render - Visible sections:', visibleSections.map(s => `${s.id} (order: ${s.order}, visible: ${s.visible})`));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {visibleSections.map((section) => (
          <SectionFactory
            key={section.id}
            sectionId={section.id}
            sectionConfig={{
              visible: section.visible,
              order: section.order,
              title: section.title
            }}
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
      </div>
    </div>
  );
};

export default Index;
