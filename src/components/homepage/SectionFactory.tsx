
// ABOUTME: Section factory for creating homepage sections
// Updated to include all section types and proper data handling

import React from 'react';
import { FeaturedSection } from './sections/FeaturedSection';
import { RecentSection } from './sections/RecentSection';
import { RecommendedSection } from './sections/RecommendedSection';
import { TrendingSection } from './sections/TrendingSection';
import { ReviewerNotesSection } from './sections/ReviewerNotesSection';
import { UpcomingSection } from './sections/UpcomingSection';

interface SectionFactoryProps {
  sectionId: string;
  sectionConfig: {
    visible: boolean;
    order: number;
    title: string;
  };
}

export const SectionFactory: React.FC<SectionFactoryProps> = ({ 
  sectionId, 
  sectionConfig 
}) => {
  if (!sectionConfig.visible) {
    return null;
  }

  switch (sectionId) {
    case 'featured':
      return <FeaturedSection />;
    case 'recent':
      return <RecentSection />;
    case 'recommended':
      return <RecommendedSection />;
    case 'trending':
      return <TrendingSection />;
    case 'reviewer':
      return <ReviewerNotesSection />;
    case 'upcoming':
      return <UpcomingSection />;
    default:
      console.warn(`Unknown section ID: ${sectionId}`);
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Warning:</strong> Unknown section type "{sectionId}"
        </div>
      );
  }
};
