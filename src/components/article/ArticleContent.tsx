
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleData } from '@/types/article';

interface ArticleContentProps {
  article: ArticleData;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ article }) => {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="pt-6">
        {article.abstract && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Abstract</h3>
            <p className="text-gray-300">{article.abstract}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2">Review</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{article.reviewContent}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
