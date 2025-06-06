
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { SendIcon, X, Type, Bold, Italic, Underline } from 'lucide-react';
import { motion } from 'framer-motion';
import { CommentImageUpload } from './CommentImageUpload';

interface CommentFormProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
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
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showControls, setShowControls] = useState(autoFocus);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsAnimating(true);
      await onSubmit(content, selectedImage || undefined);
      setContent('');
      setSelectedImage('');
      setShowFormatting(false);
      setShowControls(false);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setIsAnimating(false);
    }
  };

  const handleFocus = () => {
    setShowControls(true);
  };

  const handleFormat = (format: 'bold' | 'italic' | 'underline') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
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
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="resize-none pr-20"
            rows={showControls ? 3 : 2}
            autoFocus={autoFocus}
          />
          
          {/* Integrated controls inside textarea */}
          {showControls && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {/* Image upload */}
              <CommentImageUpload
                onImageSelect={setSelectedImage}
                onImageRemove={() => setSelectedImage('')}
                selectedImage={selectedImage}
              />
              
              {/* Cancel button (for replies) */}
              {onCancel && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
                  onClick={onCancel}
                  title="Cancelar"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              {/* Submit button */}
              <Button 
                type="submit" 
                disabled={!content.trim() || isSubmitting || isAnimating}
                size="sm"
                className="h-6 w-6 p-0 relative overflow-hidden"
                title={buttonText}
              >
                <SendIcon className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Formatting toolbar inside comment box when toggled */}
        {showControls && (
          <div className="mt-2 p-2 border border-gray-700/30 rounded-md bg-gray-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${showFormatting ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                  onClick={() => setShowFormatting(!showFormatting)}
                  title="Formatação"
                >
                  <Type className="h-3 w-3" />
                </Button>
                
                {showFormatting && (
                  <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
                      onClick={() => handleFormat('bold')}
                      title="Negrito"
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
                      onClick={() => handleFormat('italic')}
                      title="Itálico"
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
                      onClick={() => handleFormat('underline')}
                      title="Sublinhado"
                    >
                      <Underline className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Selected image preview */}
        {selectedImage && (
          <div className="mt-2">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-48 max-h-48 object-cover rounded border border-gray-700/30"
            />
          </div>
        )}
      </div>
      
      {/* Success animation */}
      {isAnimating && (
        <motion.div 
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.8], y: [0, 0, -50, -100] }}
          transition={{ duration: 1, times: [0, 0.2, 0.8, 1] }}
        >
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4">
            <SendIcon className="h-8 w-8 text-white" />
          </div>
        </motion.div>
      )}
    </form>
  );
};
