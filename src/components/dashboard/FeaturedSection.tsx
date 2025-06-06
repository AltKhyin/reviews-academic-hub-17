
// ABOUTME: Featured section with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Issue } from '@/types/issue';
import { ArticleCard } from './ArticleCard';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface FeaturedSectionProps {
  issues: Issue[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ issues }) => {
  console.log(`FeaturedSection: Rendering with ${issues.length} issues`);

  const featuredIssue = issues?.find(issue => issue.featured);
  const fallbackIssue = issues?.[0];
  const displayIssue = featuredIssue || fallbackIssue;

  if (!displayIssue) {
    console.log("FeaturedSection: No issues to display");
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
          Artigo em Destaque
        </h2>
        <div 
          className="border rounded-lg p-8 text-center"
          style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderColor: 'rgba(59, 130, 246, 0.2)' 
          }}
        >
          <p style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
            Nenhum artigo em destaque disponível no momento.
          </p>
        </div>
      </section>
    );
  }

  console.log(`FeaturedSection: Displaying issue ${displayIssue.id} (${featuredIssue ? 'featured' : 'fallback'})`);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
        Artigo em Destaque
      </h2>
      
      <div className="max-w-4xl mx-auto">
        <ArticleCard
          issue={displayIssue}
          featured={true}
          variant="featured"
          className="w-full"
        />
      </div>
    </section>
  );
};

export default FeaturedSection;
