
// ABOUTME: Enhanced section factory with comprehensive error handling and new optimized components
import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SECTION_REGISTRY, getSectionById } from '@/config/sections';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';

// Lazy load all sections for better performance with comprehensive error handling
const ReviewerNotesSection = React.lazy(() => 
  import('./sections/ReviewerNotesSection').then(module => ({ default: module.ReviewerNotesSection }))
    .catch(error => {
      console.error('Failed to load ReviewerNotesSection:', error);
      return { default: () => <div>Error loading reviewer notes section</div> };
    })
);

const FeaturedSection = React.lazy(() => 
  import('./sections/FeaturedSection').then(module => ({ default: module.FeaturedSection }))
    .catch(error => {
      console.error('Failed to load FeaturedSection:', error);
      return { default: () => <div>Error loading featured section</div> };
    })
);

const UpcomingSection = React.lazy(() => 
  import('./sections/UpcomingSection').then(module => ({ default: module.UpcomingSection }))
    .catch(error => {
      console.error('Failed to load UpcomingSection:', error);
      return { default: () => <div>Error loading upcoming section</div> };
    })
);

const OptimizedRecentSection = React.lazy(() => 
  import('./sections/OptimizedRecentSection').then(module => ({ default: module.OptimizedRecentSection }))
    .catch(error => {
      console.error('Failed to load OptimizedRecentSection:', error);
      return { default: () => <div>Error loading recent section</div> };
    })
);

const OptimizedRecommendedSection = React.lazy(() => 
  import('./sections/OptimizedRecommendedSection').then(module => ({ default: module.OptimizedRecommendedSection }))
    .catch(error => {
      console.error('Failed to load OptimizedRecommendedSection:', error);
      return { default: () => <div>Error loading recommended section</div> };
    })
);

interface SectionFactoryProps {
  sectionId: string;
  sectionConfig: {
    visible: boolean;
    order: number;
    title: string;
  };
}

// Component mapping using unified registry with new optimized sections
const SECTION_COMPONENTS = {
  ReviewerNotesSection,
  FeaturedSection,
  UpcomingSection,
  OptimizedRecentSection,
  OptimizedRecommendedSection,
} as const;

// Enhanced loading skeleton component
const SectionSkeleton = ({ sectionId }: { sectionId: string }) => (
  <div className="w-full">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Enhanced error boundary component for individual sections
const SectionErrorBoundary = ({ children, sectionId }: { children: React.ReactNode; sectionId: string }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [sectionId]);

  if (hasError) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erro ao carregar seção</h3>
          <p className="text-red-600 text-sm mt-1">
            A seção "{sectionId}" não pôde ser carregada. Tente recarregar a página.
          </p>
          <button 
            onClick={() => setHasError(false)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={() => setHasError(true)}
      fallback={null}
    >
      {children}
    </ErrorBoundary>
  );
};

export const SectionFactory: React.FC<SectionFactoryProps> = memo(({ 
  sectionId, 
  sectionConfig 
}) => {
  // Get section definition from unified registry
  const sectionDefinition = getSectionById(sectionId);
  
  if (!sectionDefinition) {
    console.warn(`SectionFactory: No section definition found for: ${sectionId}`);
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Seção não encontrada</h3>
          <p className="text-yellow-600 text-sm mt-1">
            A configuração para a seção "{sectionId}" não foi encontrada.
          </p>
        </div>
      </div>
    );
  }

  // Get component from registry with fallback
  const SectionComponent = SECTION_COMPONENTS[sectionDefinition.component as keyof typeof SECTION_COMPONENTS];

  if (!SectionComponent) {
    console.warn(`SectionFactory: No component found for section: ${sectionId} (${sectionDefinition.component})`);
    return (
      <div className="w-full">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-orange-800 font-medium">Componente não disponível</h3>
          <p className="text-orange-600 text-sm mt-1">
            O componente "{sectionDefinition.component}" para a seção "{sectionConfig.title}" não está disponível.
          </p>
        </div>
      </div>
    );
  }

  if (!sectionConfig.visible) {
    console.log(`SectionFactory: Section ${sectionId} is hidden, skipping render`);
    return null;
  }

  console.log(`SectionFactory: Rendering section: ${sectionId} (${sectionConfig.title})`);

  return (
    <SectionErrorBoundary sectionId={sectionId}>
      <div 
        className="w-full mb-12"
        data-section-id={sectionId}
        data-section-order={sectionConfig.order}
        data-section-title={sectionConfig.title}
      >
        <Suspense fallback={<SectionSkeleton sectionId={sectionId} />}>
          <SectionComponent />
        </Suspense>
      </div>
    </SectionErrorBoundary>
  );
});

SectionFactory.displayName = 'SectionFactory';
