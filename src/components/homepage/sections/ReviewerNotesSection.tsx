
// ABOUTME: Reviewer notes section component for homepage with optimized data fetching
import React from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock } from 'lucide-react';

export const ReviewerNotesSection: React.FC = () => {
  // Only enable the hook when this specific section is rendered
  const { comments, hasComments, isLoading } = useReviewerComments(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Notas dos Revisores
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-gray-300 h-8 w-8"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasComments) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Notas dos Revisores
        </h2>
        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="p-6">
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
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Notas dos Revisores
      </h2>
      <div className="space-y-4">
        {comments.slice(0, 3).map((comment) => (
          <Card key={comment.id} className="border-l-4 border-l-purple-400">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {comment.reviewer_avatar ? (
                    <img 
                      src={comment.reviewer_avatar} 
                      alt={comment.reviewer_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 text-sm font-medium">
                        {comment.reviewer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{comment.reviewer_name}</CardTitle>
                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                  Revisor
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {comment.comment}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
