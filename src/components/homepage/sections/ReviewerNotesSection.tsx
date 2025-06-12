
// ABOUTME: Reviewer notes section component for homepage
// Displays reviewer comments and notes using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ReviewerNotesSection: React.FC = () => {
  const { reviewerComments, isLoading } = useParallelDataLoader();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviewerComments.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Notas do Revisor</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhuma nota de revisor disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notas do Revisor</h2>
      <div className="space-y-4">
        {reviewerComments.slice(0, 3).map((comment) => (
          <Card key={comment.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {comment.reviewer_avatar && (
                  <img 
                    src={comment.reviewer_avatar} 
                    alt={comment.reviewer_name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <CardTitle className="text-lg">{comment.reviewer_name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
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
