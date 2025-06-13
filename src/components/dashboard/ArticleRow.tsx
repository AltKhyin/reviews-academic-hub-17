
// ABOUTME: Enhanced ArticleRow using shared user data to prevent API cascade
import React, { useMemo } from 'react';
import { ArticleCard } from './ArticleCard';
import { Issue } from '@/types/issue';
import { useOptimizedUserInteractions } from '@/hooks/useOptimizedUserInteractions';

interface ArticleRowProps {
  title: string;
  articles: Issue[];
  variant?: 'default' | 'featured';
  className?: string;
}

const ArticleRow: React.FC<ArticleRowProps> = ({ 
  title, 
  articles, 
  variant = 'default',
  className = '' 
}) => {
  const { userInteractions } = useOptimizedUserInteractions();

  // Pre-compute user interaction data for all articles to prevent individual API calls
  const articlesWithUserData = useMemo(() => {
    return articles.map(article => ({
      ...article,
      userInteractionData: {
        isBookmarked: userInteractions.bookmarks.has(article.id),
        hasWantMoreReaction: userInteractions.reactions[article.id]?.includes('want_more') || false
      }
    }));
  }, [articles, userInteractions]);

  if (!articles.length) {
    return null;
  }

  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {articlesWithUserData.map((article) => (
          <ArticleCard
            key={article.id}
            issue={article}
            variant={variant}
            userInteractionData={article.userInteractionData}
          />
        ))}
      </div>
    </div>
  );
};

export default ArticleRow;
