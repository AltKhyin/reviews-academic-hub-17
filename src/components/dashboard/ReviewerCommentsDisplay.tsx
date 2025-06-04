
import React from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export const ReviewerCommentsDisplay = () => {
  const { comments, hasComments, isLoading, deleteComment } = useReviewerComments();
  const { isAdmin, isEditor } = useAuth();

  if (isLoading) {
    return (
      <section className="mb-16">
        <Card className="border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!hasComments) {
    return (
      <section className="mb-16">
        <Card className="border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notas do Revisor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Nenhum comentário do revisor disponível
              </h3>
              <p className="text-gray-400 mb-4">
                {isAdmin || isEditor ? 
                  "Seja o primeiro a adicionar um comentário como revisor." :
                  "Aguarde novos comentários da equipe de revisão."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <Card className="border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Notas do Revisor
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-6">
              <div className="flex-shrink-0">
                <Avatar className="border-2 border-primary/20" style={{ width: '80px', height: '80px' }}>
                  <AvatarImage src={comment.reviewer_avatar} alt={comment.reviewer_name} />
                  <AvatarFallback>{comment.reviewer_name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="font-medium text-lg">{comment.reviewer_name}</h3>
                    <CheckCircle2 className="h-4 w-4 ml-1 text-blue-500" />
                  </div>
                  
                  {(isAdmin || isEditor) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-muted-foreground text-xs mb-2">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
                
                <p className="text-gray-200 leading-relaxed">{comment.comment}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};
