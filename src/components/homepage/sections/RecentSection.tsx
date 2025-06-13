
// ABOUTME: Recent articles section component for homepage
// Updated to use standardized data access patterns

import React from 'react';
import { StandardizedArticleCard } from '@/components/cards/StandardizedArticleCard';
import { useStandardizedData } from '@/hooks/useStandardizedData';

interface RecentSectionProps {
  issues?: any[];
}

export const RecentSection: React.FC<RecentSectionProps> = ({ issues }) => {
  const { useBulkContent } = useStandardizedData;
  const { issues: standardizedIssues, loading } = useBulkContent();

  const displayIssues = issues || standardizedIssues || [];

  if (loading) {
    return (
      <section className="recent-section">
        <h2 className="text-2xl font-bold mb-6 text-white">Artigos Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse h-64 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="recent-section">
      <h2 className="text-2xl font-bold mb-6 text-white">Artigos Recentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayIssues.slice(0, 6).map((issue) => (
          <StandardizedArticleCard 
            key={issue.id} 
            issue={issue}
            variant="default"
          />
        ))}
      </div>
    </section>
  );
};
