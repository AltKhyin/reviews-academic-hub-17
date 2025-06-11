
// ABOUTME: Mini changelog sidebar component with default entries
import React from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, X } from 'lucide-react';

export const MiniChangelog: React.FC = () => {
  const { config, changelogHidden, hideChangelog } = useSidebarStore();
  
  // Default changelog entries if none configured
  const defaultEntries = [
    { date: '2024-01-15', text: 'Melhorias na interface de comentários' },
    { date: '2024-01-10', text: 'Novo sistema de votação implementado' },
    { date: '2024-01-05', text: 'Correções de bugs e otimizações' },
  ];
  
  const entries = config?.changelog?.entries || defaultEntries;
  const showChangelog = config?.changelog?.show !== false && !changelogHidden;

  if (!showChangelog || entries.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800/20 border-gray-700/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm font-medium">
            <Clock className="h-4 w-4 mr-2" />
            Changelog
          </CardTitle>
          <button
            onClick={hideChangelog}
            className="p-1 hover:bg-gray-700/30 rounded"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.slice(0, 3).map((entry, index) => (
          <div key={index} className="space-y-1">
            <div className="text-xs text-gray-400">{entry.date}</div>
            <p className="text-sm text-gray-300 leading-tight">{entry.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
