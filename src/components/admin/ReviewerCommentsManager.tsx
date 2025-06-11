
import React, { useState } from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Trash2, UserRound, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewerComment as ReviewerCommentType } from '@/hooks/useReviewerComments';

const DEFAULT_REVIEWER = {
  name: 'Igor Eckert',
  avatar: '/lovable-uploads/0fcc2db7-d9e2-495a-b51e-7f8260ace1c2.png'
};

const ReviewerCommentItem = ({ comment }: { comment: ReviewerCommentType }) => {
  const { isAdmin } = useAuth();
  const { deleteComment } = useReviewerComments();
  
  return (
    <div className="flex space-x-6 p-4 border border-border rounded-lg">
      <div className="flex-shrink-0">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
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
          
          {isAdmin && (
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
  );
};

const CustomReviewerForm = ({ 
  customReviewer, 
  setCustomReviewer, 
  onClose 
}: { 
  customReviewer: { name: string; avatar: string }; 
  setCustomReviewer: (reviewer: { name: string; avatar: string }) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(customReviewer.name);
  const [avatar, setAvatar] = useState(customReviewer.avatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomReviewer({ name, avatar });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reviewer-name">Nome do Revisor</Label>
        <Input
          id="reviewer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do revisor"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reviewer-avatar">URL do Avatar</Label>
        <Input
          id="reviewer-avatar"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="URL do avatar"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
};

export const ReviewerCommentsManager = () => {
  const { comments, hasComments, addComment, isLoading } = useReviewerComments();
  const { isAdmin } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [customReviewer, setCustomReviewer] = useState(DEFAULT_REVIEWER);
  const [isCustomizing, setIsCustomizing] = useState(false);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Acesso restrito a administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment.mutate(
      { 
        comment: newComment.trim(),
        reviewerName: customReviewer.name,
        reviewerAvatar: customReviewer.avatar
      }, 
      {
        onSuccess: () => setNewComment('')
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciar Notas do Revisor</CardTitle>
          <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserRound className="h-4 w-4 mr-2" />
                Personalizar Revisor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Personalizar Revisor</DialogTitle>
              </DialogHeader>
              <CustomReviewerForm
                customReviewer={customReviewer}
                setCustomReviewer={setCustomReviewer}
                onClose={() => setIsCustomizing(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add new comment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Adicione um comentário do revisor..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!newComment.trim() || addComment.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Publicar como {customReviewer.name}
            </Button>
          </div>
        </form>

        {/* Existing comments */}
        {hasComments && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Comentários Existentes</h3>
            <div className="space-y-4">
              {comments.map((comment) => (
                <ReviewerCommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        )}

        {!hasComments && !addComment.isPending && (
          <div className="text-center text-muted-foreground py-8">
            Nenhum comentário do revisor ainda. Adicione o primeiro comentário acima.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
