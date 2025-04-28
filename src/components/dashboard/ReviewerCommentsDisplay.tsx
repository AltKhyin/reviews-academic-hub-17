
import React from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ReviewerCommentsDisplay = () => {
  const { comments, hasComments } = useReviewerComments();

  if (!hasComments) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-serif mb-6">Nota do Revisor</h2>
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-6">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={comment.reviewer_avatar} alt={comment.reviewer_name} />
                <AvatarFallback>{comment.reviewer_name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium text-lg">{comment.reviewer_name}</h3>
                  <CheckCircle2 className="h-4 w-4 ml-1 text-blue-500" />
                </div>
                
                <p className="text-muted-foreground text-xs mb-2">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
                
                <p>{comment.comment}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};
