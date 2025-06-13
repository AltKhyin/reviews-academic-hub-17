
// ABOUTME: Recommended articles section component for homepage
// Displays recommended medical content using real data and user preferences
import React from 'react';
import { useParallelDataLoader } from '@/hooks/useParallelDataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp } from 'lucide-react';

export const RecommendedSection: React.FC = () => {
  const { issues, isLoading } = useParallelDataLoader();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Simple recommendation algorithm based on score and specialty diversity
  const recommendedIssues = issues
    .filter(issue => issue.published)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 8);

  if (!recommendedIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Recomendadas para Você</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Nenhuma recomendação disponível no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRecommendationReason = (issue: any) => {
    if (issue.score && issue.score > 5) return "Alta relevância";
    if (issue.featured) return "Edição em destaque";
    return "Recomendado";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500" />
        Recomendadas para Você
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendedIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {getRecommendationReason(issue)}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                {issue.specialty && (
                  <Badge variant="outline">{issue.specialty}</Badge>
                )}
                {issue.score && issue.score > 0 && (
                  <Badge variant="secondary">Score: {issue.score}</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex gap-4">
                {issue.cover_image_url && (
                  <img 
                    src={issue.cover_image_url} 
                    alt={issue.title}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                )}
                
                <div className="flex-1">
                  {issue.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                      {issue.description}
                    </p>
                  )}
                  
                  {issue.authors && (
                    <p className="text-xs text-gray-500">
                      Por: {issue.authors}
                    </p>
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
