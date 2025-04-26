
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useComments } from '@/hooks/useComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ArticleCommentsProps {
  articleId: string;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  const { comments, isLoading } = useComments(articleId);

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="pt-6">
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-white/10 pb-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={comment.user?.avatar_url || undefined} />
                    <AvatarFallback>{comment.user?.full_name?.[0] || 'A'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{comment.user?.full_name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No comments yet.</div>
        )}
      </CardContent>
    </Card>
  );
};
