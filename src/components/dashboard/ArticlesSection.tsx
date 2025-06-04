
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
      <section className="mb-20">
        <div className="mb-10">
          <h2 className="text-4xl font-serif font-semibold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
            {sectionTitle}
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
        </div>
        <div className="relative bg-gradient-to-br from-blue-600/8 to-purple-600/8 border border-blue-500/15 rounded-3xl p-12 text-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-8">
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full shadow-inner">
                <svg className="w-16 h-16 text-blue-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium mb-4 text-gray-200">
              Conteúdo em Preparação
            </h3>
            <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto font-light">
              Nenhum artigo disponível nesta seção no momento. Nossa equipe está trabalhando para trazer novos conteúdos excepcionais.
            </p>
          </div>
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
    <section className="mb-20">
      <div className="mb-10">
        <h2 className="text-4xl font-serif font-semibold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
          {sectionTitle}
        </h2>
        <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
      </div>
      
      {filteredIssues.length === 0 ? (
        <div className="relative bg-gradient-to-br from-amber-600/8 to-orange-600/8 border border-amber-500/15 rounded-3xl p-12 text-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-8">
              <div className="p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full shadow-inner">
                <svg className="w-16 h-16 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium mb-4 text-gray-200">
              Artigos em Destaque
            </h3>
            <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto font-light">
              Todos os artigos desta seção estão sendo exibidos em destaque no momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredIssues.map((issue, index) => (
            <div
              key={issue.id}
              style={{
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards',
                opacity: 0
              }}
            >
              <ArticleCard
                issue={issue}
                variant="default"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ArticlesSection;
