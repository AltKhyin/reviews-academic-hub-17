
// ABOUTME: Layout engine for rendering homepage sections dynamically
import React from 'react';
import { SectionFactory } from './SectionFactory';

interface HomepageLayoutEngineProps {
  isLoading: boolean;
  parallelData: any;
  issuesData: any[];
  sidebarData: any;
  sectionsConfig: Array<{
    id: string;
    name: string;
    enabled: boolean;
    order: number;
  }>;
}

export const HomepageLayoutEngine: React.FC<HomepageLayoutEngineProps> = ({
  isLoading,
  parallelData,
  issuesData,
  sidebarData,
  sectionsConfig,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const enabledSections = sectionsConfig
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {enabledSections.map(section => (
        <SectionFactory
          key={section.id}
          sectionType={section.id}
          data={{
            issues: issuesData,
            sidebarData,
            parallelData,
          }}
        />
      ))}
    </div>
  );
};
