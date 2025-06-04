
import React, { useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';

export const CommentCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    comments, 
    commentCarouselIndex, 
    setCommentCarouselIndex, 
    isLoadingComments 
  } = useSidebarStore();

  // Auto-rotate comments every 6 seconds
  useEffect(() => {
    if (!comments?.length || comments.length <= 1) return;

    const interval = setInterval(() => {
      setCommentCarouselIndex((commentCarouselIndex + 1) % comments.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [comments, commentCarouselIndex, setCommentCarouselIndex]);

  if (isLoadingComments) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="p-3 bg-gray-800 rounded-lg space-y-2 h-24">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-3 bg-gray-700 rounded flex-1 animate-pulse" />
          </div>
          <div className="h-12 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!comments?.length) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Comentários em Destaque</h3>
        <p className="text-xs text-gray-500">Nenhum comentário destacado</p>
      </div>
    );
  }

  const currentComment = comments[commentCarouselIndex];

  const handleCommentClick = () => {
    if (currentComment.thread_id) {
      navigate(`/community`);
    }
  };

  const truncateText = (text: string, maxLength: number = 140) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Comentários em Destaque</h3>
        {comments.length > 1 && (
          <div className="flex space-x-1">
            {comments.map((_, index) => (
              <button
                key={index}
                onClick={() => setCommentCarouselIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === commentCarouselIndex ? 'bg-blue-500' : 'bg-gray-600'
                }`}
                aria-label={`Ir para comentário ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Fixed height container to prevent layout shift */}
      <div className="h-24">
        <div 
          className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors h-full flex flex-col"
          onClick={handleCommentClick}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              {currentComment.author_avatar ? (
                <img
                  src={currentComment.author_avatar}
                  alt={currentComment.author_name || 'Usuário'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                  {(currentComment.author_name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 truncate">
              {currentComment.author_name || 'Usuário anônimo'}
            </span>
            <div className="flex items-center space-x-1 text-xs text-green-400 ml-auto">
              <ChevronUp className="w-3 h-3" />
              <span>{currentComment.votes}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-200 leading-relaxed line-clamp-3 flex-1">
            {truncateText(currentComment.body)}
          </p>
        </div>
      </div>
    </div>
  );
};
