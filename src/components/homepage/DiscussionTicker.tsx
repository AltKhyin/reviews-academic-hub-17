
// ABOUTME: Animated discussion ticker showing top community threads
// Implements smooth CSS animations with pause-on-hover and accessibility features

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, TrendingUp } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  comments: number;
  votes: number;
  created_at: string;
  thread_type: string;
}

interface DiscussionTickerProps {
  threads: Thread[];
  isLoading?: boolean;
  className?: string;
}

const TickerItem: React.FC<{ thread: Thread; index: number }> = ({ thread, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/community/post/${thread.id}`);
  };

  return (
    <div 
      className="ticker-item cursor-pointer flex items-center gap-3 py-2 px-3 min-w-max"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Discussão: ${thread.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-center gap-2 text-accent-blue-400">
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{thread.comments}</span>
      </div>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm">{thread.votes}</span>
      </div>
      
      <div className="text-foreground">
        <span className="text-sm font-medium line-clamp-1">
          {thread.title}
        </span>
      </div>
      
      {thread.thread_type === 'recent' && (
        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
          Novo
        </span>
      )}
    </div>
  );
};

export const DiscussionTicker: React.FC<DiscussionTickerProps> = ({ 
  threads, 
  isLoading = false, 
  className = '' 
}) => {
  if (isLoading) {
    return (
      <section className={`w-full py-4 border-y border-border/30 ${className}`} aria-label="Carregando discussões">
        <div className="max-w-magazine mx-auto px-6">
          <h2 className="text-lg font-serif font-semibold mb-3">Discussões em Alta</h2>
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <section className={`w-full py-4 border-y border-border/30 ${className}`} aria-label="Discussões">
        <div className="max-w-magazine mx-auto px-6">
          <h2 className="text-lg font-serif font-semibold mb-3">Discussões em Alta</h2>
          <div className="bg-muted/20 rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma discussão ativa no momento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`w-full py-4 border-y border-border/30 ${className}`}
      aria-label="Discussões em alta"
    >
      <div className="max-w-magazine mx-auto px-6">
        <h2 className="text-lg font-serif font-semibold mb-3">Discussões em Alta</h2>
        
        <div className="ticker-container relative overflow-hidden rounded-lg bg-sheet/50 border border-border/20">
          <div className="flex animate-ticker hover:animation-paused">
            {/* Duplicate threads for seamless loop */}
            {[...threads, ...threads].map((thread, index) => (
              <TickerItem 
                key={`${thread.id}-${index}`} 
                thread={thread} 
                index={index} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscussionTicker;
