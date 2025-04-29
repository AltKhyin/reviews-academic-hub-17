
import React from 'react';
import { useCommunitySettings } from '@/hooks/useCommunityPosts';

export const CommunityHeader = () => {
  const { data: settings, isLoading } = useCommunitySettings();

  if (isLoading) {
    return (
      <div className="w-full h-40 bg-gray-800/20 mb-8 rounded-lg animate-pulse"></div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="mb-8">
      <div 
        className="w-full h-40 rounded-lg bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${settings.header_image_url})`,
          backgroundColor: settings.theme_color || '#1e40af'
        }}
      >
        <div className="w-full h-full bg-black/30 flex items-center justify-center rounded-lg">
          <h1 className="text-4xl font-serif text-white font-bold">Comunidade</h1>
        </div>
      </div>
    </div>
  );
};
