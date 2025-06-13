
// ABOUTME: Trending section component for homepage
// Displays trending content with proper data handling

import React from 'react';

interface TrendingSectionProps {
  trendingData?: any;
  sectionConfig?: {
    visible: boolean;
    order: number;
    title: string;
  };
  onConfigChange?: (updates: any) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingData,
  sectionConfig,
  onConfigChange
}) => {
  return (
    <section className="trending-section mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {sectionConfig?.title || 'Em Alta'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingData?.items?.length > 0 ? (
          trendingData.items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-md font-semibold text-white mb-2">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.category}</span>
                <span>🔥 {item.trend_score}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p>Nenhum conteúdo em alta disponível.</p>
          </div>
        )}
      </div>
    </section>
  );
};
