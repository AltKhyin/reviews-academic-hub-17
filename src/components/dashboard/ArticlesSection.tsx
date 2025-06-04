
import React from 'react';
import { Issue } from '@/types/issue';
import { ArticleCard } from './ArticleCard';

interface ArticlesSectionProps {
  issues: Issue[];
  featuredIssueId?: string;
  sectionTitle: string;
  sectionType: 'recent' | 'recommended' | 'trending';
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  issues,
  featuredIssueId,
  sectionTitle,
  sectionType
}) => {
  console.log(`ArticlesSection (${sectionType}): Rendering with ${issues.length} issues`);

  if (!issues || issues.length === 0) {
    console.log(`ArticlesSection (${sectionType}): No issues to display`);
    return (
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {sectionTitle}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/10 rounded-2xl p-8 text-center backdrop-blur-sm">
          <p className="text-gray-300 text-lg leading-relaxed">
            Nenhum artigo disponível nesta seção no momento.
          </p>
        </div>
      </section>
    );
  }

  // Filter out the featured issue from other sections to avoid duplication
  const filteredIssues = featuredIssueId 
    ? issues.filter(issue => issue.id !== featuredIssueId)
    : issues;

  console.log(`ArticlesSection (${sectionType}): Filtered to ${filteredIssues.length} issues (excluding featured)`);

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-semibold mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {sectionTitle}
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      
      {filteredIssues.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/10 rounded-2xl p-8 text-center backdrop-blur-sm">
          <p className="text-gray-300 text-lg leading-relaxed">
            Todos os artigos desta seção estão sendo exibidos em destaque.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredIssues.map((issue) => (
            <ArticleCard
              key={issue.id}
              issue={issue}
              variant="default"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ArticlesSection;
