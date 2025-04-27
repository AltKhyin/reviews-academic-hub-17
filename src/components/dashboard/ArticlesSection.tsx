
import React from 'react';
import { Issue } from '@/types/issue';
import ArticleRow from './ArticleRow';

interface ArticlesSectionProps {
  issues: Issue[];
  featuredIssueId?: string;
  sectionTitle?: string;
  sectionType?: string;
}

export const ArticlesSection = ({ 
  issues, 
  featuredIssueId,
  sectionTitle,
  sectionType = "recent"
}: ArticlesSectionProps) => {
  const transformIssueToArticle = (issue: Issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    image: issue.cover_image_url || '/placeholder.svg',
    category: issue.specialty,
    date: new Date(issue.created_at).toLocaleDateString('pt-BR')
  });

  // Filter issues based on section type
  const getFilteredIssues = () => {
    const filteredIssues = issues.filter(issue => issue.id !== featuredIssueId);
    
    switch(sectionType) {
      case 'recent':
        return filteredIssues.slice(0, 5);
      case 'recommended':
        // For demo purposes, just randomize and take 5
        return [...filteredIssues]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
      case 'trending':
        // Another randomization for demo
        return [...filteredIssues]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
      default:
        return filteredIssues.slice(0, 5);
    }
  };

  const displayIssues = getFilteredIssues();
  
  if (displayIssues.length === 0) {
    return null;
  }

  return (
    <ArticleRow 
      title={sectionTitle || "Artigos"} 
      articles={displayIssues.map(transformIssueToArticle)} 
    />
  );
};
