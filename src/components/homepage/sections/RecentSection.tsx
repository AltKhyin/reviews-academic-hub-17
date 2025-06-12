
// ABOUTME: Recent editions section component for homepage
// Displays recently published medical content using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const RecentSection: React.FC = () => {
  const { issues, isLoading } = useParallelDataLoader();

  // Get recent issues (filter out featured and sort by publication date)
  const recentIssues = React.useMemo(() => {
    return issues
      .filter(issue => issue.published && !issue.featured)
      .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
      .slice(0, 6);
  }, [issues]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Edições Recentes
        </h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhuma edição recente disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Edições Recentes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentIssues.map((issue) => (
          <Card key={issue.id}>
            <CardHeader>
              <CardTitle className="text-lg">{issue.title}</CardTitle>
              {issue.specialty && (
                <p className="text-sm text-gray-500">{issue.specialty}</p>
              )}
              <p className="text-sm text-gray-500">
                Publicado em {new Date(issue.published_at || issue.created_at).toLocaleDateString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                {issue.description || 'Conteúdo médico especializado.'}
              </p>
              {issue.authors && (
                <p className="text-xs text-gray-400 mt-2">
                  {issue.authors}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
