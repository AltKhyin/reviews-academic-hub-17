
// ABOUTME: Featured section component for homepage
// Updated to use standardized data access patterns

import React from 'react';
import { StandardizedArticleCard } from '@/components/cards/StandardizedArticleCard';
import { useStandardizedData } from '@/hooks/useStandardizedData';

interface FeaturedSectionProps {
  issue?: any;
  issues?: any[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ issue, issues }) => {
  const { useBulkContent } = useStandardizedData;
  const { featuredIssue, loading } = useBulkContent();

  const displayIssue = issue || featuredIssue;

  if (loading || !displayIssue) {
    return <div className="animate-pulse h-96 bg-gray-800 rounded-lg" />;
  }

  return (
    <section className="featured-section mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Em Destaque</h2>
      <StandardizedArticleCard 
        issue={displayIssue}
        variant="featured"
        className="featured-card"
      />
    </section>
  );
};
