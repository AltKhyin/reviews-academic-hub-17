
import React from 'react';
import { MessageSquare, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';

export const TopThreads: React.FC = () => {
  const navigate = useNavigate();
  const { threads, isLoadingThreads } = useSidebarStore();

  if (isLoadingThreads) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 bg-gray-800 rounded-lg">
              <div className="h-4 bg-gray-700 rounded mb-2 animate-pulse" />
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
        <h3 className="text-sm font-medium text-gray-300">Discussões em Alta</h3>
        <p className="text-xs text-gray-500">Nenhuma discussão ativa</p>
      </div>
    );
  }

  const handleThreadClick = (thread: any) => {
    navigate('/community');
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-300">Discussões em Alta</h3>
      
      <div className="space-y-2">
        {threads.slice(0, 3).map((thread) => (
          <div
            key={thread.id}
            className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors group"
            onClick={() => handleThreadClick(thread)}
          >
            <div className="flex items-start space-x-2">
              <div className="flex items-center space-x-1 text-xs text-gray-400 mt-0.5">
                {thread.thread_type === 'recent' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <MessageSquare className="w-3 h-3" />
                )}
                <span>{thread.comments}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 font-medium line-clamp-2 group-hover:text-white transition-colors">
                  {thread.title}
                </p>
                {thread.thread_type === 'recent' && (
                  <span className="text-xs text-blue-400 mt-1 block">Recente</span>
                )}
              </div>
              
              <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors mt-0.5 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
