
// ABOUTME: Main home page component with horizontal scrollable sections - Monochromatic design compliant
import React, { useMemo } from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import { ReviewerNotesSection } from '@/components/home/sections/ReviewerNotesSection';
import { FeaturedCarouselSection } from '@/components/home/sections/FeaturedCarouselSection';
import { RecentIssuesSection } from '@/components/home/sections/RecentIssuesSection';
import { PopularIssuesSection } from '@/components/home/sections/PopularIssuesSection';
import { RecommendedIssuesSection } from '@/components/home/sections/RecommendedIssuesSection';
import { UpcomingReleasesSection } from '@/components/home/sections/UpcomingReleasesSection';

const SECTION_COMPONENTS = {
  reviewer_notes: ReviewerNotesSection,
  featured_carousel: FeaturedCarouselSection,
  recent_issues: RecentIssuesSection,
  popular_issues: PopularIssuesSection,
  recommended_issues: RecommendedIssuesSection,
  upcoming_releases: UpcomingReleasesSection,
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
      <div className="min-h-screen bg-background">
        <div className="max-w-full px-6 py-8">
          <div className="space-y-16">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-6">
                <div className="h-8 bg-muted animate-pulse rounded w-1/4"></div>
                <div className="flex gap-6 overflow-hidden">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-[260px] h-[380px] bg-muted/60 animate-pulse rounded-lg flex-shrink-0"></div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-full px-6 py-8">
        <div className="space-y-16">
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
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Bem-vindo
              </h2>
              <p className="text-muted-foreground">
                Configure as seções da página inicial no painel administrativo para começar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
