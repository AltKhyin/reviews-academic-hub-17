
// ABOUTME: Section factory component for dynamic homepage section rendering
// Maps section IDs to their corresponding components with simplified interface

import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { ArticlesGridSection } from './sections/ArticlesGridSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { ReviewerNotesSection } from './sections/ReviewerNotesSection';
import { FeaturedSection } from './sections/FeaturedSection';
import { UpcomingSection } from './sections/UpcomingSection';
import { RecentSection } from './sections/RecentSection';
import { RecommendedSection } from './sections/RecommendedSection';
import { TrendingSection } from './sections/TrendingSection';

interface SectionFactoryProps {
  sectionId: string;
  sectionConfig: {
    visible: boolean;
    order: number;
    title: string;
  };
}

const SECTION_COMPONENTS = {
  hero: HeroSection,
  articles: ArticlesGridSection,
  reviews: ReviewsSection,
  reviewer: ReviewerNotesSection,
  featured: FeaturedSection,
  upcoming: UpcomingSection,
  recent: RecentSection,
  recommended: RecommendedSection,
  trending: TrendingSection,
} as const;

export const SectionFactory: React.FC<SectionFactoryProps> = ({ 
  sectionId, 
  sectionConfig 
}) => {
  const SectionComponent = SECTION_COMPONENTS[sectionId as keyof typeof SECTION_COMPONENTS];

  if (!SectionComponent) {
    console.warn(`No component found for section: ${sectionId}`);
    return null;
  }

  if (!sectionConfig.visible) {
    console.log(`Section ${sectionId} is hidden, skipping render`);
    return null;
  }

  console.log(`Rendering section: ${sectionId} (${sectionConfig.title})`);

  return (
    <div 
      className={`w-full ${sectionId === 'hero' ? 'bg-white shadow-sm' : ''}`}
      data-section-id={sectionId}
      data-section-order={sectionConfig.order}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionComponent />
      </div>
    </div>
  );
};
