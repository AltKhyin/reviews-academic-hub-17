
import React from 'react';
import { ArticleCard } from './ArticleCard';
import { Issue } from '@/types/issue';

interface ArticlesSectionProps {
  featuredIssue?: Issue | null;
  recentIssues?: Issue[];
  stats?: {
    totalIssues: number;
    totalSpecialties: number;
    totalAuthors: number;
  };
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ 
  recentIssues = [] 
}) => {
  console.log(`ArticlesSection: Rendering with ${recentIssues.length} recent issues`);

  if (recentIssues.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Artigos Recentes</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Nenhum artigo recente disponível no momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Artigos Recentes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentIssues.map((issue) => (
          <ArticleCard
            key={issue.id}
            issue={issue}
            variant="default"
            className="w-full"
          />
        ))}
      </div>
    </section>
  );
};

export default ArticlesSection;
