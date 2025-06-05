
// ABOUTME: Article content component with enhanced dark theme styling
// Displays article content with proper contrast and visual hierarchy

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleData } from '@/types/article';

interface ArticleContentProps {
  article: ArticleData;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
  return (
    <Card 
      className="border shadow-lg"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
        color: '#ffffff'
      }}
    >
      <CardContent className="pt-6">
        {article.abstract && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
              Abstract
            </h3>
            <p style={{ color: '#d1d5db' }}>{article.abstract}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
            Review
          </h3>
          <div className="prose prose-invert max-w-none">
            <p style={{ color: '#d1d5db' }}>{article.reviewContent}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
