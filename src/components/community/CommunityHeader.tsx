
// ABOUTME: Community header with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { useCommunitySettings } from '@/hooks/useCommunityPosts';
import { CSS_VARIABLES } from '@/utils/colorSystem';

export const CommunityHeader = () => {
  const { data: settings, isLoading } = useCommunitySettings();

  if (isLoading) {
    return (
      <div 
        className="w-full h-40 mb-8 rounded-lg animate-pulse"
        style={{ backgroundColor: CSS_VARIABLES.TERTIARY_BG }}
      ></div>
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
          backgroundColor: settings.theme_color || '#3b82f6'
        }}
      >
        <div className="w-full h-full bg-black/30 flex items-center justify-center rounded-lg">
          <h1 className="text-4xl font-serif font-bold" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
            Comunidade
          </h1>
        </div>
      </div>
    </div>
  );
};
