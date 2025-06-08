
// ABOUTME: Updated article card using archive visual style
import React from 'react';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { ArchiveStyleArticleCard } from './ArchiveStyleArticleCard';

interface ArticleCardProps {
  issue: Issue;
  onClick?: () => void;
  variant?: 'default' | 'featured';
  featured?: boolean;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  issue, 
  onClick, 
  variant = 'default', 
  featured = false,
  className = '' 
}) => {
  return (
    <ArchiveStyleArticleCard
      issue={issue}
      onClick={onClick}
      variant={variant}
      featured={featured}
      className={className}
    />
  );
};
