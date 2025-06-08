
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
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6 text-center">
          <p className="text-gray-300">
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
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">{sectionTitle}</h2>
      
      {filteredIssues.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6 text-center">
          <p className="text-gray-300">
            Todos os artigos desta seção estão sendo exibidos em destaque.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2" style={{ gap: '8px' }}>
          {filteredIssues.map((issue) => (
            <div key={issue.id} style={{ width: 'calc(100% * 1.2)' }} className="min-w-0">
              <ArticleCard
                issue={issue}
                variant="default"
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ArticlesSection;
