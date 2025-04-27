
import React from 'react';
import { Issue } from '@/types/issue';
import FeaturedArticle from './FeaturedArticle';

interface FeaturedSectionProps {
  issues: Issue[];
}

export const FeaturedSection = ({ issues }: FeaturedSectionProps) => {
  const featuredIssue = issues.find(issue => issue.featured) || issues[0];

  if (!featuredIssue) return null;

  const transformIssueToArticle = (issue: Issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    image: issue.cover_image_url || '/placeholder.svg',
    category: issue.specialty,
    date: new Date(issue.created_at).toLocaleDateString('pt-BR')
  });

  return <FeaturedArticle article={transformIssueToArticle(featuredIssue)} />;
};
