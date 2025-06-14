
import React from 'react';
import { ArticleCard } from './ArticleCard';

interface FeaturedSectionProps {
  featuredIssue?: {
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at: string;
    authors?: string;
    description?: string;
  } | null;
  recentIssues?: Array<{
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at: string;
    authors?: string;
    score?: number;
  }>;
  stats?: {
    totalIssues: number;
    totalSpecialties: number;
    totalAuthors: number;
  };
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ 
  featuredIssue, 
  recentIssues = [] 
}) => {
  console.log(`FeaturedSection: Rendering with featuredIssue:`, featuredIssue);

  const displayIssue = featuredIssue || recentIssues[0];

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
