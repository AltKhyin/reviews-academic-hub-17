
// ABOUTME: Top threads sidebar component with proper data handling
import React from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, TrendingUp } from 'lucide-react';

export const TopThreads: React.FC = () => {
  const { threads, isLoadingThreads } = useSidebarStore();

  if (isLoadingThreads) {
    return (
      <Card className="bg-gray-800/20 border-gray-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <TrendingUp className="h-4 w-4 mr-2" />
            Discussões em Alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Card className="bg-gray-800/20 border-gray-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <TrendingUp className="h-4 w-4 mr-2" />
            Discussões em Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Nenhuma discussão encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/20 border-gray-700/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <TrendingUp className="h-4 w-4 mr-2" />
          Discussões em Alta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {threads.map((thread) => (
          <div key={thread.id} className="space-y-1">
            <h4 className="text-sm font-medium leading-tight line-clamp-2">
              {thread.title}
            </h4>
            <div className="flex items-center text-xs text-gray-400 space-x-3">
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                {thread.comments}
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {thread.votes}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
