
import React from 'react';
import { MessageSquare, ArrowUp, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const TopThreads: React.FC = () => {
  const navigate = useNavigate();
  const { threads, isLoadingThreads } = useSidebarStore();

  if (isLoadingThreads) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="flex items-center space-x-2">
                <div className="h-3 bg-gray-700 rounded w-12 animate-pulse" />
                <div className="h-3 bg-gray-700 rounded w-8 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!threads?.length) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Discussões em Alta</h3>
        <p className="text-xs text-gray-500">Nenhuma discussão ativa</p>
      </div>
    );
  }

  const handleThreadClick = (thread: any) => {
    navigate('/community');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Discussões em Alta</h3>
      
      <div className="space-y-3">
        {threads.slice(0, 3).map((thread, index) => (
          <div
            key={thread.id}
            className="cursor-pointer hover:bg-gray-800/30 -mx-2 px-2 py-2 rounded transition-colors group"
            onClick={() => handleThreadClick(thread)}
          >
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="flex items-center space-x-1 text-gray-500 mt-0.5 flex-shrink-0">
                  <ArrowUp className="w-3 h-3" />
                  <span className="text-xs">{thread.votes || 0}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 font-medium line-clamp-2 group-hover:text-gray-200 transition-colors">
                    {thread.title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 ml-8">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{thread.comments} comentários</span>
                </div>
                
                <span>
                  {formatDistanceToNow(new Date(thread.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
