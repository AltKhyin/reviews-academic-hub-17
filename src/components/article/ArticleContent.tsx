
// ABOUTME: Article content component with enhanced dark theme styling
// Displays article content with proper contrast and visual hierarchy using consistent colors

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleData } from '@/types/article';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface ArticleContentProps {
  article: ArticleData;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
  return (
    <Card 
      className="border shadow-lg"
      style={{ 
        backgroundColor: CSS_VARIABLES.SECONDARY_BG,
        borderColor: CSS_VARIABLES.BORDER_DEFAULT,
        color: CSS_VARIABLES.TEXT_PRIMARY
      }}
    >
      <CardContent className="pt-6">
        {article.abstract && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
              Abstract
            </h3>
            <p style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>{article.abstract}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
            Review
          </h3>
          <div className="prose prose-invert max-w-none">
            <p style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>{article.reviewContent}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
