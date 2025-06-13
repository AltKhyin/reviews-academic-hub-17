
// ABOUTME: Optimized Recent Issues section with horizontal scroll and zero per-card API calls
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';

interface IssueCardProps {
  issue: {
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at?: string;
  };
  isFirst?: boolean;
}

const OptimizedIssueCard: React.FC<IssueCardProps> = ({ issue, isFirst = false }) => {
  const cardWidth = isFirst ? 'w-80' : 'w-40';
  const imageHeight = isFirst ? 'h-48' : 'h-32';
  
  return (
    <Card className={`${cardWidth} ${imageHeight} flex-shrink-0 group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105`}>
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
          <h3 className={`font-semibold leading-tight mb-2 ${isFirst ? 'text-lg' : 'text-sm'}`}>
            {issue.title}
          </h3>
          
          {/* Additional info on hover for all cards, always visible for first card */}
          <div className={`transition-all duration-300 ${isFirst ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
          </div>
        </div>
      </div>
    </Card>
  );
};

export const OptimizedRecentSection: React.FC = () => {
  const { data } = useOptimizedHomepage();
  
  // Use issues from the already loaded data - no additional API calls
  const recentIssues = data?.issues?.slice(0, 8) || [];
  
  if (recentIssues.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Edições Recentes</h2>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {recentIssues.map((issue, index) => (
            <OptimizedIssueCard
              key={issue.id}
              issue={issue}
              isFirst={index === 0}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};
