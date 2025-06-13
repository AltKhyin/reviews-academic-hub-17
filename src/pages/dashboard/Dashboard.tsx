
// ABOUTME: Main dashboard page with integrated homepage bridge and section factory
// Connected to homepage manager for real-time section configuration updates

import React, { useEffect } from 'react';
import { useHomepageBridge } from '@/hooks/useHomepageBridge';
import { SectionFactory } from '@/components/homepage/SectionFactory';
import { PageLoader } from '@/components/ui/PageLoader';
import { AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const {
    sectionsConfig,
    homepageData,
    isConfigLoading,
    isDataLoading,
    dataError,
    updateSectionConfig,
    isReady
  } = useHomepageBridge();

  useEffect(() => {
    console.log('Dashboard: Homepage bridge state', {
      sectionsConfig,
      homepageData,
      isReady
    });
  }, [sectionsConfig, homepageData, isReady]);

  if (isConfigLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <PageLoader />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-red-200">
            Não foi possível carregar os dados da homepage.
          </p>
        </div>
      </div>
    );
  }

  if (!sectionsConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-300 mb-2">Configurando homepage...</h2>
          <p className="text-gray-400">
            Carregando configurações das seções.
          </p>
        </div>
      </div>
    );
  }

  // Sort sections by order
  const sortedSections = Object.entries(sectionsConfig)
    .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
    .filter(([, config]) => config.visible);

  return (
    <div className="dashboard-page" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {sortedSections.map(([sectionId, sectionConfig]) => (
            <SectionFactory
              key={sectionId}
              sectionId={sectionId}
              sectionConfig={sectionConfig}
              homepageData={homepageData}
              onConfigChange={updateSectionConfig}
            />
          ))}
          
          {sortedSections.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold text-gray-300 mb-2">Nenhuma seção ativa</h2>
              <p className="text-gray-400">
                Configure as seções da homepage no painel de administração.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
