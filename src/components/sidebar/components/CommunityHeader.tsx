
import React from 'react';
import { Users, Circle } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const CommunityHeader: React.FC = () => {
  const { config, stats, isLoadingConfig, isLoadingStats } = useSidebarStore();

  if (isLoadingConfig || isLoadingStats) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">Reviews.</h2>
        <p className="text-sm text-gray-400">
          {config?.tagline || 'Quem aprende junto, cresce.'}
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-1 text-gray-300">
          <Users className="w-4 h-4" />
          <span>{stats?.totalUsers || 0} inscritos</span>
        </div>
        
        <div className="flex items-center space-x-1 text-green-400">
          <Circle className="w-2 h-2 fill-current animate-pulse" />
          <span>{stats?.onlineUsers || 0} online</span>
        </div>
      </div>
    </div>
  );
};
