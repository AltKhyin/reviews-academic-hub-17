
// ABOUTME: Optimized Recent Issues section with scientific journal styling and zero API calls
// Horizontal scrollable layout with leftmost card 2x width

import React from 'react';
import { useOptimizedHomepageContext } from '@/contexts/OptimizedHomepageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export const OptimizedRecentSection: React.FC = () => {
  const { issues, isLoading } = useOptimizedHomepageContext();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="w-96 h-64 bg-gray-200 rounded flex-shrink-0"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-48 h-64 bg-gray-200 rounded flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  const recentIssues = issues
    .filter(issue => issue.published)
    .slice(0, 6);

  if (!recentIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Edições Recentes</h2>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">
              Nenhuma edição recente disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const isNew = (dateString: string) => {
    const issueDate = new Date(dateString);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return issueDate > weekAgo;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Edições Recentes</h2>
      
      {/* Horizontal scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
        {recentIssues.map((issue, index) => (
          <Card 
            key={issue.id} 
            className={`
              group relative overflow-hidden border-white/10 bg-white/5 hover:bg-white/10 
              transition-all duration-300 hover:scale-105 cursor-pointer flex-shrink-0
              ${index === 0 ? 'w-96' : 'w-48'}
            `}
            style={{ height: '320px' }}
          >
            {/* Cover Image */}
            <div className="absolute inset-0">
              {issue.cover_image_url ? (
                <img 
                  src={issue.cover_image_url} 
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Sem imagem</span>
                </div>
              )}
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Content overlay */}
            <CardContent className="absolute inset-0 p-4 flex flex-col justify-end text-white">
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                {isNew(issue.published_at || issue.created_at) && (
                  <Badge className="bg-green-600/80 text-green-100 border-green-500/50">
                    Novo
                  </Badge>
                )}
                {issue.specialty && (
                  <Badge variant="outline" className="border-white/30 text-white/90 bg-black/30">
                    {issue.specialty}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className={`font-semibold mb-2 line-clamp-3 ${index === 0 ? 'text-xl' : 'text-base'}`}>
                {issue.title}
              </h3>
              
              {/* Expanded info on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                {issue.description && (
                  <p className={`text-gray-300 line-clamp-2 ${index === 0 ? 'text-sm' : 'text-xs'}`}>
                    {issue.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(issue.published_at || issue.created_at)}</span>
                  </div>
                  
                  {issue.authors && (
                    <span className="truncate max-w-24" title={issue.authors}>
                      {issue.authors}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
