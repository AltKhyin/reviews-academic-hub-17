
// ABOUTME: Trending articles section for homepage
// Fixed to use proper data loading patterns

import React from 'react';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock } from 'lucide-react';

export const TrendingSection: React.FC = () => {
  const { data, isLoading, error } = useOptimizedHomepage();

  if (isLoading) {
    return (
      <div className="trending-section">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.issues) {
    return (
      <div className="trending-section">
        <div className="text-center py-8">
          <p className="text-gray-500">Não foi possível carregar as tendências</p>
        </div>
      </div>
    );
  }

  const trendingIssues = data.issues
    .filter(issue => issue.published && issue.score)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 8);

  if (trendingIssues.length === 0) {
    return (
      <div className="trending-section">
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma tendência disponível no momento</p>
        </div>
      </div>
    );
  }

  return (
    <section className="trending-section mb-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <h2 className="text-2xl font-bold">Em Alta</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingIssues.map((issue, index) => (
          <Card key={issue.id} className="hover:shadow-lg transition-shadow relative">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="default" className="bg-green-500">
                #{index + 1}
              </Badge>
            </div>
            <CardHeader>
              {issue.cover_image_url && (
                <img
                  src={issue.cover_image_url}
                  alt={issue.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <CardTitle className="line-clamp-2 text-sm">{issue.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(issue.published_at || issue.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {issue.specialty && (
                  <Badge variant="outline" className="text-xs">
                    {issue.specialty}
                  </Badge>
                )}
              </div>
              {issue.score && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600 text-xs">
                    Score: {issue.score}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
