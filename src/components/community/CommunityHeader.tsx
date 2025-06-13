
// ABOUTME: Community header using simple settings hook
import React from 'react';
import { useCommunitySettings } from '@/hooks/community/useCommunitySettings';

export const CommunityHeader: React.FC = () => {
  const { data: settings, isLoading } = useCommunitySettings();

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="h-48 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
      </div>
    );
  }

  // Use default values if no settings are configured
  const headerImageUrl = settings?.header_image_url;
  const themeColor = settings?.theme_color || '#1e40af';
  const description = settings?.description || 'Welcome to our community! Share your thoughts and connect with others.';

  return (
    <div className="mb-8">
      {headerImageUrl && (
        <div 
          className="h-48 bg-cover bg-center rounded-lg mb-4"
          style={{ backgroundImage: `url(${headerImageUrl})` }}
        />
      )}
      <div className="text-center">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ color: themeColor }}
        >
          Community
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};
