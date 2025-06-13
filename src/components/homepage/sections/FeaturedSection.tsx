
// ABOUTME: Featured section component for homepage
// Displays featured content with proper data handling

import React from 'react';

interface FeaturedSectionProps {
  featuredData?: any;
  sectionConfig?: {
    visible: boolean;
    order: number;
    title: string;
  };
  onConfigChange?: (updates: any) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  featuredData,
  sectionConfig,
  onConfigChange
}) => {
  return (
    <section className="featured-section mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {sectionConfig?.title || 'Em Destaque'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredData?.items?.length > 0 ? (
          featuredData.items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm">
                {item.description}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p>Nenhum conteúdo em destaque disponível.</p>
          </div>
        )}
      </div>
    </section>
  );
};
