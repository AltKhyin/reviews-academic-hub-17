
// ABOUTME: Optimized Recommended Issues section with 2x3 grid and zero per-card API calls
import React from 'react';
import { Card } from '@/components/ui/card';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';

interface RecommendedIssueCardProps {
  issue: {
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at?: string;
    score?: number;
  };
}

const OptimizedRecommendedCard: React.FC<RecommendedIssueCardProps> = ({ issue }) => {
  return (
    <Card className="aspect-[3/4] group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105">
      <div className="relative w-full h-full">
        {/* Cover Image */}
        {issue.cover_image_url ? (
          <img
            src={issue.cover_image_url}
            alt={issue.title || 'Issue cover'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-center p-4">
              <div className="text-lg font-medium mb-2">
                {issue.specialty || 'Medicina'}
              </div>
              <div className="text-sm opacity-70">
                Sem imagem
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay with transparent background for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:from-black/90 transition-all duration-300" />
        
        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-sm leading-tight mb-2">
            {issue.title}
          </h3>
          
          {/* Additional info on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="bg-white/20 px-2 py-1 rounded text-xs">
                {issue.specialty}
              </span>
              {issue.published_at && (
                <span>
                  {new Date(issue.published_at).getFullYear()}
                </span>
              )}
            </div>
            {issue.score && (
              <div className="mt-2">
                <div className="bg-white/20 px-2 py-1 rounded text-xs inline-block">
                  Score: {issue.score.toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const OptimizedRecommendedSection: React.FC = () => {
  const { data } = useOptimizedHomepage();
  
  // Use issues from the already loaded data, prioritize by score - no additional API calls
  const recommendedIssues = data?.issues
    ?.filter(issue => issue.score && issue.score > 0)
    ?.sort((a, b) => (b.score || 0) - (a.score || 0))
    ?.slice(0, 6) || [];
  
  // If no scored issues, fall back to recent issues
  const finalRecommended = recommendedIssues.length > 0 
    ? recommendedIssues 
    : data?.issues?.slice(3, 9) || [];
  
  if (finalRecommended.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recomendados para você</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {finalRecommended.map((issue) => (
          <OptimizedRecommendedCard
            key={issue.id}
            issue={issue}
          />
        ))}
      </div>
    </section>
  );
};
