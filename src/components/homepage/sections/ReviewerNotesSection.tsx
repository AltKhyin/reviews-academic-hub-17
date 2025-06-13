
// ABOUTME: Reviewer notes section for homepage
// Fixed to use proper data loading patterns

import React from 'react';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';

export const ReviewerNotesSection: React.FC = () => {
  const { data, isLoading, error } = useOptimizedHomepage();

  if (isLoading) {
    return (
      <div className="reviewer-notes-section">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.reviewerComments) {
    return (
      <div className="reviewer-notes-section">
        <div className="text-center py-8">
          <p className="text-gray-500">Não foi possível carregar os comentários</p>
        </div>
      </div>
    );
  }

  const comments = data.reviewerComments.slice(0, 5);

  if (comments.length === 0) {
    return (
      <div className="reviewer-notes-section">
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum comentário disponível no momento</p>
        </div>
      </div>
    );
  }

  return (
    <section className="reviewer-notes-section mb-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h2 className="text-2xl font-bold">Notas dos Revisores</h2>
      </div>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={comment.reviewer_avatar} />
                  <AvatarFallback>
                    {comment.reviewer_name?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{comment.reviewer_name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
