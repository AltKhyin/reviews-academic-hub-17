
// ABOUTME: Article review list with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ReviewStatusBadge } from './ReviewStatus';
import { ArticleReviewData } from '@/types/issue';
import { formatDistanceToNow } from 'date-fns';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface ArticleReviewListProps {
  reviews: ArticleReviewData[];
  isLoading?: boolean;
}

export const ArticleReviewList: React.FC<ArticleReviewListProps> = ({ reviews, isLoading = false }) => {
  if (isLoading) {
    return <div className="p-4" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p style={{ color: CSS_VARIABLES.TEXT_MUTED }}>No reviews available for this article.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="border-b pb-4 last:border-0"
            style={{ borderColor: CSS_VARIABLES.BORDER_DEFAULT }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                  <AvatarFallback>
                    {review.reviewer?.full_name?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
                    {review.reviewer?.full_name || 'Anonymous Reviewer'}
                  </p>
                  <p className="text-sm" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <ReviewStatusBadge status={review.status} />
            </div>
            {review.comments && (
              <div className="mt-4" style={{ color: CSS_VARIABLES.TEXT_SECONDARY }}>
                <p>{review.comments}</p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
