
// ABOUTME: Section factory for creating homepage sections with standardized data integration
// Updated to include all section types, proper data handling, and homepage bridge integration

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
  homepageData?: any;
  onConfigChange?: (sectionId: string, updates: any) => void;
}

export const SectionFactory: React.FC<SectionFactoryProps> = ({ 
  sectionId, 
  sectionConfig,
  homepageData,
  onConfigChange
}) => {
  if (!sectionConfig.visible) {
    return null;
  }

  // Pass relevant data to each section based on section type
  const getSectionProps = () => {
    const baseProps = {
      sectionConfig,
      onConfigChange: onConfigChange ? (updates: any) => onConfigChange(sectionId, updates) : undefined
    };

    switch (sectionId) {
      case 'featured':
        return {
          ...baseProps,
          featuredData: homepageData?.sectionsData?.featured
        };
      case 'recent':
        return {
          ...baseProps,
          recentData: homepageData?.sectionsData?.recent
        };
      case 'recommended':
        return {
          ...baseProps,
          recommendedData: homepageData?.sectionsData?.recommended
        };
      case 'trending':
        return {
          ...baseProps,
          trendingData: homepageData?.sectionsData?.trending
        };
      case 'reviewer':
        return {
          ...baseProps,
          reviewerData: homepageData?.sectionsData?.reviewer
        };
      case 'upcoming':
        return {
          ...baseProps,
          upcomingData: homepageData?.sectionsData?.upcoming
        };
      default:
        return baseProps;
    }
  };

  const sectionProps = getSectionProps();

  switch (sectionId) {
    case 'featured':
      return <FeaturedSection {...sectionProps} />;
    case 'recent':
      return <RecentSection {...sectionProps} />;
    case 'recommended':
      return <RecommendedSection {...sectionProps} />;
    case 'trending':
      return <TrendingSection {...sectionProps} />;
    case 'reviewer':
      return <ReviewerNotesSection {...sectionProps} />;
    case 'upcoming':
      return <UpcomingSection {...sectionProps} />;
    default:
      console.warn(`Unknown section ID: ${sectionId}`);
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Warning:</strong> Unknown section type "{sectionId}"
        </div>
      );
  }
};
