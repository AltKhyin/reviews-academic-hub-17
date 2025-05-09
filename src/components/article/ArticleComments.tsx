
import React from 'react';
import { CommentSection } from '@/components/comments/CommentSection';

interface ArticleCommentsProps {
  articleId: string;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  // Pass the ID to the refactored CommentSection
  return (
    <div className="mt-8 border-t border-gray-800 pt-8">
      <CommentSection articleId={articleId} />
    </div>
  );
};
