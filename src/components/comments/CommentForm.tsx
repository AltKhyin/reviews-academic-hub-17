
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, SendIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsAnimating(true);
      await onSubmit(content);
      setContent('');
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setIsAnimating(false);
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
    <form onSubmit={handleSubmit} className="flex items-start gap-3 relative">
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
            disabled={!content.trim() || isSubmitting || isAnimating}
            size="sm"
            className="relative overflow-hidden"
          >
            {isSubmitting ? 'Enviando...' : (
              <>
                {buttonText}
                <SendIcon className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Success animation that appears when comment is submitted */}
      {isAnimating && (
        <motion.div 
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.8], y: [0, 0, -50, -100] }}
          transition={{ duration: 1, times: [0, 0.2, 0.8, 1] }}
        >
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
        </motion.div>
      )}
    </form>
  );
};
