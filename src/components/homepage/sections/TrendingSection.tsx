
// ABOUTME: Trending content section component for homepage
// Displays most accessed and popular medical content using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TrendingSection: React.FC = () => {
  const { issues, isLoading } = useParallelDataLoader();

  // Get trending issues (highest scores, published)
  const trendingIssues = React.useMemo(() => {
    return issues
      .filter(issue => issue.published)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
  }, [issues]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!trendingIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Mais Acessados
        </h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhum conteúdo em tendência disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBadgeVariant = (index: number) => {
    if (index === 0) return "destructive"; // Hot
    if (index === 1) return "default"; // Trending  
    return "secondary"; // Popular
  };

  const getBadgeText = (index: number) => {
    if (index === 0) return "Hot";
    if (index === 1) return "Trending";
    return "Popular";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Mais Acessados
      </h2>
      <div className="space-y-4">
        {trendingIssues.map((issue, index) => (
          <Card key={issue.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <Badge variant={getBadgeVariant(index)}>
                  {getBadgeText(index)}
                </Badge>
              </div>
              {issue.specialty && (
                <p className="text-sm text-gray-500">{issue.specialty}</p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                {issue.description || 'Conteúdo popular entre os usuários.'}
              </p>
              <div className="flex justify-between items-center mt-2">
                {issue.authors && (
                  <p className="text-xs text-gray-400">{issue.authors}</p>
                )}
                {issue.score && issue.score > 0 && (
                  <p className="text-xs text-gray-500">
                    Score: {issue.score}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
