
// ABOUTME: Fixed comment form with proper avatar display and error handling
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit,
  isSubmitting = false,
  placeholder = 'Compartilhe seus pensamentos...'
}) => {
  const [comment, setComment] = useState('');
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para deixar um comentário.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    try {
      await onSubmit(comment.trim());
      setComment('');
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar comentário. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Fixed: Get user's actual avatar and display name
  const userInitial = profile?.full_name ? profile.full_name[0].toUpperCase() : 
                     user?.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : 
                     user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <Card className="border-white/5 bg-gray-800/10 mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            {/* Fixed: User's actual avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-600 text-white font-medium">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder={placeholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none bg-gray-800/20 border-gray-700/30"
                disabled={isSubmitting || !user}
              />
              {!user && (
                <p className="mt-2 text-sm text-yellow-400">
                  Por favor, faça login para comentar.
                </p>
              )}
              
              <div className="flex justify-end mt-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !user || !comment.trim()}
                >
                  {isSubmitting ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
