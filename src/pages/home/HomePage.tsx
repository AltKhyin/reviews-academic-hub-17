
// ABOUTME: Main home page component with optimized section rendering
import React, { useMemo } from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ReviewerNotesSection } from '@/components/home/sections/ReviewerNotesSection';
import { FeaturedCarouselSection } from '@/components/home/sections/FeaturedCarouselSection';
import { RecentIssuesSection } from '@/components/home/sections/RecentIssuesSection';
import { PopularIssuesSection } from '@/components/home/sections/PopularIssuesSection';
import { RecommendedIssuesSection } from '@/components/home/sections/RecommendedIssuesSection';
import { UpcomingReleasesHomeSection } from '@/components/home/sections/UpcomingReleasesHomeSection';

const SECTION_COMPONENTS = {
  reviewer_notes: ReviewerNotesSection,
  featured_carousel: FeaturedCarouselSection,
  recent_issues: RecentIssuesSection,
  popular_issues: PopularIssuesSection,
  recommended_issues: RecommendedIssuesSection,
  upcoming_releases: UpcomingReleasesHomeSection,
} as const;

export const HomePage: React.FC = () => {
  const { homeSettings, isLoading } = useHomeData();

  // Memoize section order to prevent unnecessary re-renders
  const orderedSections = useMemo(() => {
    if (!homeSettings) return [];

    return Object.entries(homeSettings.sections)
      .filter(([_, config]) => config.visible)
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([sectionId]) => sectionId as keyof typeof SECTION_COMPONENTS);
  }, [homeSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HomeHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-gray-300 animate-pulse rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HomeHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {orderedSections.map((sectionId) => {
            const SectionComponent = SECTION_COMPONENTS[sectionId];
            return (
              <section key={sectionId} className="scroll-mt-8">
                <SectionComponent />
              </section>
            );
          })}
          
          {orderedSections.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Bem-vindo à Central de Evidências
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Configure as seções da página inicial no painel administrativo para começar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
