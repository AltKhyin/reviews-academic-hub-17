
// ABOUTME: Section factory for creating homepage sections
// Updated to use standardized data access patterns

import React from 'react';
import { FeaturedSection } from './sections/FeaturedSection';
import { RecentSection } from './sections/RecentSection';
import { useStandardizedData } from '@/hooks/useStandardizedData';

interface SectionFactoryProps {
  sectionType: string;
  data?: any;
}

export const SectionFactory: React.FC<SectionFactoryProps> = ({ sectionType, data }) => {
  const { useBulkContent } = useStandardizedData;
  const { issues, loading, featuredIssue } = useBulkContent();

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-800 rounded-lg" />;
  }

  switch (sectionType) {
    case 'featured':
      return <FeaturedSection issue={featuredIssue} issues={issues} />;
    case 'recent':
      return <RecentSection issues={issues} />;
    default:
      return null;
  }
};
