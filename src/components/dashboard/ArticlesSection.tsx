
import React from 'react';
import { Issue } from '@/types/issue';
import ArticleRow from './ArticleRow';

interface ArticlesSectionProps {
  issues: Issue[];
  featuredIssueId?: string;
}

export const ArticlesSection = ({ issues, featuredIssueId }: ArticlesSectionProps) => {
  const transformIssueToArticle = (issue: Issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    image: issue.cover_image_url || '/placeholder.svg',
    category: issue.specialty,
    date: new Date(issue.created_at).toLocaleDateString('pt-BR')
  });

  const recentIssues = issues
    .filter(issue => issue.id !== featuredIssueId)
    .slice(0, 5);

  const recommendedIssues = [...issues]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const mostViewedIssues = [...issues]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return (
    <>
      {recentIssues.length > 0 && (
        <ArticleRow 
          title="Edições Recentes" 
          articles={recentIssues.map(transformIssueToArticle)} 
        />
      )}

      {recommendedIssues.length > 0 && (
        <ArticleRow 
          title="Recomendados para você" 
          articles={recommendedIssues.map(transformIssueToArticle)} 
        />
      )}

      {mostViewedIssues.length > 0 && (
        <ArticleRow 
          title="Mais acessados" 
          articles={mostViewedIssues.map(transformIssueToArticle)} 
        />
      )}
    </>
  );
};
