
// ABOUTME: Recommended articles section for homepage
// Fixed to use proper data loading patterns

import React from 'react';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';

export const RecommendedSection: React.FC = () => {
  const { data, isLoading, error } = useOptimizedHomepage();

  if (isLoading) {
    return (
      <div className="recommended-section">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.issues) {
    return (
      <div className="recommended-section">
        <div className="text-center py-8">
          <p className="text-gray-500">Não foi possível carregar as recomendações</p>
        </div>
      </div>
    );
  }

  const recommendedIssues = data.issues
    .filter(issue => issue.published && issue.score && issue.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6);

  if (recommendedIssues.length === 0) {
    return (
      <div className="recommended-section">
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma recomendação disponível no momento</p>
        </div>
      </div>
    );
  }

  return (
    <section className="recommended-section mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-500" />
        <h2 className="text-2xl font-bold">Recomendados para você</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {issue.cover_image_url && (
                <img
                  src={issue.cover_image_url}
                  alt={issue.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <CardTitle className="line-clamp-2">{issue.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(issue.published_at || issue.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {issue.specialty && (
                  <Badge variant="secondary">{issue.specialty}</Badge>
                )}
              </div>
              {issue.score && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-yellow-600">
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
