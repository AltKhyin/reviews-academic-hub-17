
// ABOUTME: Optimized Recommended section with 2x3 grid layout and scientific journal styling
// Zero API calls with enhanced recommendation algorithm integration

import React from 'react';
import { useOptimizedHomepageContext } from '@/contexts/OptimizedHomepageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp } from 'lucide-react';

export const OptimizedRecommendedSection: React.FC = () => {
  const { issues, isLoading } = useOptimizedHomepageContext();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced recommendation algorithm based on score and specialty diversity
  const recommendedIssues = issues
    .filter(issue => issue.published)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6);

  if (!recommendedIssues.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <Star className="w-6 h-6 text-yellow-500" />
          Recomendadas para Você
        </h2>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-8 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <Star className="w-6 h-6 text-yellow-500" />
        Recomendadas para Você
      </h2>
      
      {/* 2x3 Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        {recommendedIssues.map((issue) => (
          <Card 
            key={issue.id} 
            className="group relative overflow-hidden border-white/10 bg-white/5 hover:bg-white/10 
                     transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-yellow-400/60"
            style={{ height: '240px' }}
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
              {/* Recommendation badge */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className="bg-yellow-600/80 text-yellow-100 border-yellow-500/50 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {getRecommendationReason(issue)}
                </Badge>
                
                {issue.specialty && (
                  <Badge variant="outline" className="border-white/30 text-white/90 bg-black/30">
                    {issue.specialty}
                  </Badge>
                )}
                
                {issue.score && issue.score > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Score: {issue.score}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold mb-2 line-clamp-2 text-base">
                {issue.title}
              </h3>
              
              {/* Expanded info on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                {issue.description && (
                  <p className="text-gray-300 text-xs line-clamp-2">
                    {issue.description}
                  </p>
                )}
                
                {issue.authors && (
                  <p className="text-xs text-gray-400">
                    Por: {issue.authors}
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
