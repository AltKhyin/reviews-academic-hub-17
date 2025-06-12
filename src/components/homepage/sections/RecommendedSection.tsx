
// ABOUTME: Recommended content section component for homepage
// Displays recommended medical articles and resources using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const RecommendedSection: React.FC = () => {
  const { issues, isLoading } = useParallelDataLoader();

  // Get recommended issues (high score, not featured)
  const recommendedIssues = React.useMemo(() => {
    return issues
      .filter(issue => issue.published && !issue.featured)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 4);
  }, [issues]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendedIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Star className="w-6 h-6" />
          Recomendados
        </h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhum conteúdo recomendado disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="w-6 h-6" />
        Recomendados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendedIssues.map((issue, index) => (
          <Card key={issue.id} className={`border-l-4 ${index === 0 ? 'border-l-yellow-400' : 'border-l-blue-400'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {index === 0 && <Star className="w-4 h-4 text-yellow-500" />}
                {issue.title}
              </CardTitle>
              {issue.specialty && (
                <p className="text-sm text-gray-500">{issue.specialty}</p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                {issue.description || 'Conteúdo recomendado baseado em qualidade e relevância.'}
              </p>
              {issue.score && issue.score > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Score: {issue.score}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
