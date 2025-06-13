
// ABOUTME: Recommended section component for homepage
// Displays recommended content with proper data handling

import React from 'react';

interface RecommendedSectionProps {
  recommendedData?: any;
  sectionConfig?: {
    visible: boolean;
    order: number;
    title: string;
  };
  onConfigChange?: (updates: any) => void;
}

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  recommendedData,
  sectionConfig,
  onConfigChange
}) => {
  return (
    <section className="recommended-section mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {sectionConfig?.title || 'Recomendados'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedData?.items?.length > 0 ? (
          recommendedData.items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                {item.description}
              </p>
              <div className="text-xs text-gray-400">
                Score: {item.score || 'N/A'}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p>Nenhum conteúdo recomendado disponível.</p>
          </div>
        )}
      </div>
    </section>
  );
};
