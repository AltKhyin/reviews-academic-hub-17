
import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSidebarStore } from '@/stores/sidebarStore';

export const CommentCarousel: React.FC = () => {
  const { 
    comments, 
    commentCarouselIndex, 
    setCommentCarouselIndex, 
    isLoadingComments 
  } = useSidebarStore();

  // Auto-rotate comments every 8 seconds
  useEffect(() => {
    if (!comments?.length || comments.length <= 1) return;

    const interval = setInterval(() => {
      setCommentCarouselIndex((commentCarouselIndex + 1) % comments.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [comments, commentCarouselIndex, setCommentCarouselIndex]);

  if (isLoadingComments) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-24 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!comments?.length) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Comentários em Destaque</h3>
        <p className="text-xs text-gray-500">Nenhum comentário em destaque</p>
      </div>
    );
  }

  const currentComment = comments[commentCarouselIndex];
  const canNavigate = comments.length > 1;

  const goToPrevious = () => {
    if (!canNavigate) return;
    const newIndex = commentCarouselIndex === 0 ? comments.length - 1 : commentCarouselIndex - 1;
    setCommentCarouselIndex(newIndex);
  };

  const goToNext = () => {
    if (!canNavigate) return;
    setCommentCarouselIndex((commentCarouselIndex + 1) % comments.length);
  };

  const timeAgo = formatDistanceToNow(new Date(currentComment.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Comentários em Destaque</h3>
        {canNavigate && (
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPrevious}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Comentário anterior"
            >
              <ChevronLeft className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={goToNext}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Próximo comentário"
            >
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}
      </div>
      
      <div 
        className="p-3 bg-gray-800 rounded-lg space-y-3 transition-all duration-300"
        role="region"
        aria-live="polite"
        aria-label="Comentário em destaque"
      >
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            {currentComment.author_avatar ? (
              <img
                src={currentComment.author_avatar}
                alt={currentComment.author_name || 'Autor'}
                className="w-6 h-6 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {(currentComment.author_name || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-gray-300">
                {currentComment.author_name || 'Usuário'}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
            
            <p className="text-sm text-gray-200 leading-relaxed">
              {currentComment.body}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <MessageSquare className="w-3 h-3" />
            <span>{currentComment.votes} curtidas</span>
          </div>
          
          {canNavigate && (
            <div className="flex space-x-1">
              {comments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCommentCarouselIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === commentCarouselIndex ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                  aria-label={`Ir para comentário ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
