
// ABOUTME: Enhanced section factory with lazy loading and performance optimizations
import React, { Suspense, memo } from 'react';

// Lazy load all sections for better performance
const HeroSection = React.lazy(() => import('./sections/HeroSection').then(module => ({ default: module.HeroSection })));
const ArticlesGridSection = React.lazy(() => import('./sections/ArticlesGridSection').then(module => ({ default: module.ArticlesGridSection })));
const ReviewsSection = React.lazy(() => import('./sections/ReviewsSection').then(module => ({ default: module.ReviewsSection })));
const ReviewerNotesSection = React.lazy(() => import('./sections/ReviewerNotesSection').then(module => ({ default: module.ReviewerNotesSection })));
const FeaturedSection = React.lazy(() => import('./sections/FeaturedSection').then(module => ({ default: module.FeaturedSection })));
const UpcomingSection = React.lazy(() => import('./sections/UpcomingSection').then(module => ({ default: module.UpcomingSection })));
const RecentSection = React.lazy(() => import('./sections/RecentSection').then(module => ({ default: module.RecentSection })));
const RecommendedSection = React.lazy(() => import('./sections/RecommendedSection').then(module => ({ default: module.RecommendedSection })));
const TrendingSection = React.lazy(() => import('./sections/TrendingSection').then(module => ({ default: module.TrendingSection })));

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

// Loading skeleton component
const SectionSkeleton = ({ sectionId }: { sectionId: string }) => (
  <div className={`w-full ${sectionId === 'hero' ? 'bg-white shadow-sm' : ''}`}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

// Error boundary component for individual sections
const SectionErrorBoundary = ({ children, sectionId }: { children: React.ReactNode; sectionId: string }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [sectionId]);

  if (hasError) {
    return (
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Erro ao carregar seção</h3>
            <p className="text-red-600 text-sm mt-1">
              A seção "{sectionId}" não pôde ser carregada. Tente recarregar a página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.ErrorBoundary
      onError={() => setHasError(true)}
      fallback={null}
    >
      {children}
    </React.ErrorBoundary>
  );
};

export const SectionFactory: React.FC<SectionFactoryProps> = memo(({ 
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
    <SectionErrorBoundary sectionId={sectionId}>
      <div 
        className={`w-full ${sectionId === 'hero' ? 'bg-white shadow-sm' : ''}`}
        data-section-id={sectionId}
        data-section-order={sectionConfig.order}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<SectionSkeleton sectionId={sectionId} />}>
            <SectionComponent />
          </Suspense>
        </div>
      </div>
    </SectionErrorBoundary>
  );
});

SectionFactory.displayName = 'SectionFactory';
