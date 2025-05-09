
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  placeholder = "Adicione um comentário...",
  buttonText = "Comentar",
  autoFocus = false,
  onCancel
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-4 text-gray-400 border border-dashed border-gray-700 rounded-md">
        Faça login para participar da discussão
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="mb-2 resize-none"
          rows={2}
          autoFocus={autoFocus}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={!content.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Enviando...' : buttonText}
          </Button>
        </div>
      </div>
    </form>
  );
};
