import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ReviewStatusBadge } from './ReviewStatus';
import { ArticleReviewData } from '@/types/issue';
import { formatDistanceToNow } from 'date-fns';

interface ArticleReviewListProps {
  reviews: ArticleReviewData[];
  isLoading?: boolean;
}

export const ArticleReviewList: React.FC<ArticleReviewListProps> = ({ reviews, isLoading = false }) => {
  if (isLoading) {
    return <div className="p-4">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No reviews available for this article.</p>
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
          <div key={review.id} className="border-b border-gray-700 pb-4 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                  <AvatarFallback>
                    {review.reviewer?.full_name?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{review.reviewer?.full_name || 'Anonymous Reviewer'}</p>
                  <p className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <ReviewStatusBadge status={review.status} />
            </div>
            {review.comments && (
              <div className="mt-4 text-gray-300">
                <p>{review.comments}</p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
