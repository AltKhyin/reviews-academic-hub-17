
// ABOUTME: Upcoming section component for homepage
// Displays upcoming content and releases

import React from 'react';

interface UpcomingSectionProps {
  upcomingData?: any;
  sectionConfig?: {
    visible: boolean;
    order: number;
    title: string;
  };
  onConfigChange?: (updates: any) => void;
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  upcomingData,
  sectionConfig,
  onConfigChange
}) => {
  return (
    <section className="upcoming-section mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {sectionConfig?.title || 'Próximas Publicações'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingData?.releases?.length > 0 ? (
          upcomingData.releases.map((release: any, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                {release.title}
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                {release.description}
              </p>
              <div className="text-xs text-blue-400">
                Previsão: {release.release_date}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p>Nenhuma publicação programada.</p>
          </div>
        )}
      </div>
    </section>
  );
};
