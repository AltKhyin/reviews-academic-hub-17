
import React from 'react';
import { ArticleData } from '@/types/article';
import { ArticleActions } from './ArticleActions';

interface ArticleHeaderProps {
  article: ArticleData;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ article }) => {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-400 mb-2">
        {article.journal} • {article.year}
      </div>
      <h1 className="font-serif text-3xl font-medium text-white mb-3">
        {article.title}
      </h1>
      <div className="text-sm text-gray-300 mb-4">
        Artigo original por {article.author}
      </div>
      <div className="text-sm text-gray-300 mb-6">
        Revisado por <span className="text-white">{article.reviewedBy}</span> em {article.reviewDate}
      </div>
      
      <div className="mt-4 mb-6">
        <ArticleActions articleId={article.id} />
      </div>
    </div>
  );
};
