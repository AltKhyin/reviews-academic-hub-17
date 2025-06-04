
import React from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const CommunityHeader: React.FC = () => {
  const { config, isLoadingConfig } = useSidebarStore();

  if (isLoadingConfig) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-left">
        <h2 className="text-xl font-bold text-white mb-1">Reviews.</h2>
        <p className="text-sm text-gray-400">
          {config?.tagline || 'Quem aprende junto, cresce.'}
        </p>
      </div>
    </div>
  );
};
