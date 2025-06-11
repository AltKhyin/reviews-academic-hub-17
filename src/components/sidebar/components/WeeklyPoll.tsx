
// ABOUTME: Weekly poll sidebar component with proper data handling
import React from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const WeeklyPoll: React.FC = () => {
  const { poll, isLoadingPoll } = useSidebarStore();

  if (isLoadingPoll) {
    return (
      <Card className="bg-gray-800/20 border-gray-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <BarChart3 className="h-4 w-4 mr-2" />
            Enquete da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-800 rounded"></div>
              <div className="h-8 bg-gray-800 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card className="bg-gray-800/20 border-gray-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <BarChart3 className="h-4 w-4 mr-2" />
            Enquete da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Nenhuma enquete ativa no momento</p>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);

  return (
    <Card className="bg-gray-800/20 border-gray-700/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <BarChart3 className="h-4 w-4 mr-2" />
          Enquete da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <h4 className="text-sm font-medium">{poll.question}</h4>
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const votes = poll.votes[index] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{option}</span>
                  <span className="text-gray-400">{votes}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-400 pt-1">
          Total: {totalVotes} votos
        </div>
      </CardContent>
    </Card>
  );
};
