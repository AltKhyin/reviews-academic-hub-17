
// ABOUTME: Reviewer notes section component for homepage
// Displays reviewer comments and notes with optimized fetching

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReviewerComments } from '@/hooks/useReviewerComments';

export const ReviewerNotesSection: React.FC = () => {
  // Use optimized hook that only fetches when needed
  const { comments, hasComments, isLoading } = useReviewerComments(true);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Notas do Revisor</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasComments) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Notas do Revisor</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sem notas disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aguarde novos comentários dos revisores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notas do Revisor</h2>
      <div className="space-y-4">
        {comments.slice(0, 2).map((comment) => (
          <Card key={comment.id}>
            <CardHeader>
              <CardTitle className="text-lg">Nota de {comment.reviewer_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {comment.comment}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
