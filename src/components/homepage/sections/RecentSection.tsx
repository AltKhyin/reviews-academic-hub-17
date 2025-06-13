
// ABOUTME: Recent articles section component for homepage
// Displays recently published medical content using real data
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';

export const RecentSection: React.FC = () => {
  const { issues, isLoading } = useParallelDataLoader();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
        <h2 className="text-2xl font-bold mb-6">Edições Recentes</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Edições Recentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                {isNew(issue.published_at || issue.created_at) && (
                  <Badge className="ml-2 bg-green-100 text-green-800">Novo</Badge>
                )}
              </div>
              {issue.specialty && (
                <Badge variant="outline" className="self-start">
                  {issue.specialty}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent>
              {issue.cover_image_url && (
                <img 
                  src={issue.cover_image_url} 
                  alt={issue.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              
              {issue.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {issue.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(issue.published_at || issue.created_at)}</span>
                </div>
                
                {issue.authors && (
                  <span className="truncate max-w-32" title={issue.authors}>
                    {issue.authors}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
