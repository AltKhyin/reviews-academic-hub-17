
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { SendIcon, X, Type, Bold, Italic, Underline, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    }
  };

  // Render formatted content for preview
  const renderFormattedContent = (text: string) => {
    return text
      .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
      .replace(/<em>(.*?)<\/em>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
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
          
          {/* Preview of formatted content */}
          {content && showControls && (
            <div 
              className="absolute inset-x-3 top-3 bottom-12 pointer-events-none text-transparent"
              dangerouslySetInnerHTML={{ __html: renderFormattedContent(content) }}
              style={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                padding: 'inherit',
                border: 'none',
                background: 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflow: 'hidden'
              }}
            />
          )}
          
          {/* Integrated controls inside textarea */}
          {showControls && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {/* Image upload with preview */}
              {!selectedImage ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="comment-image-upload"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
                    onClick={() => document.getElementById('comment-image-upload')?.click()}
                    title="Adicionar imagem"
                  >
                    <Image className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 p-1 bg-gray-800/40 rounded">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-4 h-4 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-gray-400 hover:text-red-400"
                    onClick={() => setSelectedImage('')}
                    title="Remover imagem"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              )}
              
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
        
        {/* Bottom-left formatting controls */}
        {showControls && (
          <div className="mt-2 flex items-center gap-2">
            {/* Formatting toggle button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${showFormatting ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setShowFormatting(!showFormatting)}
              title="Formatação"
            >
              <Type className="h-3 w-3 mr-1" />
              Formatação
            </Button>

            {/* Formatting options - expanding to the right */}
            {showFormatting && (
              <motion.div 
                className="flex items-center gap-1 p-1 bg-gray-800/60 rounded border border-gray-700/30"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
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
              </motion.div>
            )}
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
