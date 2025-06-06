
// ABOUTME: Article header with consistent color system
// Displays article metadata using app colors

import React from 'react';
import { ArticleData } from '@/types/article';
import { ArticleActions } from './ArticleActions';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface ArticleHeaderProps {
  article: ArticleData;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ article }) => {
  return (
    <div className="mb-6">
      <div className="text-sm mb-2" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>
        {article.journal} • {article.year}
      </div>
      <h1 className="font-serif text-3xl font-medium mb-3" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
        {article.title}
      </h1>
      <div className="text-sm mb-4" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
        Artigo original por {article.author}
      </div>
      <div className="text-sm mb-6" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
        Revisado por <span style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>{article.reviewedBy}</span> em {article.reviewDate}
      </div>
      
      <div className="mt-4 mb-6">
        <ArticleActions articleId={article.id} />
      </div>
    </div>
  );
};
