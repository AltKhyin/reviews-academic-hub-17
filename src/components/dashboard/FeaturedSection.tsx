
import React from 'react';
import { Issue } from '@/types/issue';
import { ArticleCard } from './ArticleCard';

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
        <h2 className="text-2xl font-bold mb-6">Artigo em Destaque</h2>
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-8 text-center">
          <p className="text-gray-300">
            Nenhum artigo em destaque disponível no momento.
          </p>
        </div>
      </section>
    );
  }

  console.log(`FeaturedSection: Displaying issue ${displayIssue.id} (${featuredIssue ? 'featured' : 'fallback'})`);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Artigo em Destaque</h2>
      
      <div className="max-w-4xl mx-auto">
        <ArticleCard
          issue={displayIssue}
          variant="featured"
          featured={true}
          className="w-full"
        />
      </div>
    </section>
  );
};

export default FeaturedSection;
