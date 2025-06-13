
// ABOUTME: Recent section component for homepage
// Displays recent content with proper data handling

import React from 'react';

interface RecentSectionProps {
  recentData?: any;
  sectionConfig?: {
    visible: boolean;
    order: number;
    title: string;
  };
  onConfigChange?: (updates: any) => void;
}

export const RecentSection: React.FC<RecentSectionProps> = ({
  recentData,
  sectionConfig,
  onConfigChange
}) => {
  return (
    <section className="recent-section mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {sectionConfig?.title || 'Recentes'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentData?.items?.length > 0 ? (
          recentData.items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-md font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-xs">
                {item.date}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p>Nenhum conteúdo recente disponível.</p>
          </div>
        )}
      </div>
    </section>
  );
};
