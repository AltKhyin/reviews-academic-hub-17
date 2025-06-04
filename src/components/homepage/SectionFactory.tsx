
// ABOUTME: Section factory component for dynamic homepage section rendering
// Maps section IDs to their corresponding components

import React from 'react';
import { SectionLayoutConfig } from '@/types/layout';
import { LayoutContainer } from '@/components/layout/LayoutContainer';
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
  section: SectionLayoutConfig;
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

export const SectionFactory: React.FC<SectionFactoryProps> = ({ section }) => {
  const SectionComponent = SECTION_COMPONENTS[section.id as keyof typeof SECTION_COMPONENTS];

  if (!SectionComponent) {
    console.warn(`No component found for section: ${section.id}`);
    return null;
  }

  return (
    <LayoutContainer
      sectionId={section.id}
      padding={section.padding}
      margin={section.margin}
      size={section.size}
      centerContent={true}
      className={section.id === 'hero' ? 'bg-white shadow-sm' : ''}
    >
      <SectionComponent />
    </LayoutContainer>
  );
};
