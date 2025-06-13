
// ABOUTME: Trending articles section component for homepage
// Displays most viewed/popular medical content using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Activity } from 'lucide-react';

export const TrendingSection: React.FC = () => {
  const { issues, isLoading } = useParallelDataLoader();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Sort by score to get trending content
  const trendingIssues = issues
    .filter(issue => issue.published)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10);

  if (!trendingIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Mais Acessadas</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Nenhum conteúdo em tendência no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendingBadge = (index: number, score: number) => {
    if (index === 0) return { text: "#1 Trending", color: "bg-red-100 text-red-800" };
    if (index < 3) return { text: `#${index + 1} Hot`, color: "bg-orange-100 text-orange-800" };
    if (score && score > 5) return { text: "Popular", color: "bg-blue-100 text-blue-800" };
    return { text: "Trending", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-red-500" />
        Mais Acessadas
      </h2>
      
      <div className="space-y-4">
        {trendingIssues.map((issue, index) => {
          const badge = getTrendingBadge(index, issue.score || 0);
          
          return (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      #{index + 1}
                    </div>
                  </div>
                  
                  {issue.cover_image_url && (
                    <img 
                      src={issue.cover_image_url} 
                      alt={issue.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{issue.title}</h3>
                      <Badge className={badge.color}>
                        {badge.text}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {issue.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {issue.specialty}
                        </Badge>
                      )}
                      
                      {issue.score && issue.score > 0 && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>Score: {issue.score}</span>
                        </div>
                      )}
                      
                      {issue.authors && (
                        <span className="truncate">
                          {issue.authors}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
