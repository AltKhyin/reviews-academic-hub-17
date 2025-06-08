
// ABOUTME: Optimized reviewer comments display with conditional data fetching
import React from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock } from 'lucide-react';

export const ReviewerCommentsDisplay: React.FC = () => {
  // Only enable the hook when this component is actually rendered
  const { comments, hasComments, isLoading } = useReviewerComments(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <MessageSquare className="w-6 h-6" />
          Comentários dos Revisores
        </h2>
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-600 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!hasComments) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <MessageSquare className="w-6 h-6" />
          Comentários dos Revisores
        </h2>
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6 text-center">
          <p className="text-gray-300">
            Nenhum comentário de revisor disponível no momento.
          </p>
        </div>
      </section>
    );
  }

  // Show only the most recent comment
  const latestComment = comments[0];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
        <MessageSquare className="w-6 h-6" />
        Comentários dos Revisores
      </h2>
      
      <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {latestComment.reviewer_avatar ? (
                <img 
                  src={latestComment.reviewer_avatar} 
                  alt={latestComment.reviewer_name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-medium">
                    {latestComment.reviewer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg text-white">{latestComment.reviewer_name}</CardTitle>
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(latestComment.created_at)}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-400/30">
              Revisor
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">
            {latestComment.comment}
          </p>
          {comments.length > 1 && (
            <p className="text-gray-500 text-sm mt-3">
              +{comments.length - 1} comentário{comments.length > 2 ? 's' : ''} adicional{comments.length > 2 ? 'is' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
