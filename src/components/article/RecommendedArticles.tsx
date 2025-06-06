
// ABOUTME: Recommended articles component with consistent color system
// Uses app colors for proper visual identity

import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';
import { CSS_VARIABLES } from '@/utils/colorSystem';

export const RecommendedArticles = ({ currentArticleId }: { currentArticleId: string }) => {
  const navigate = useNavigate();
  
  const { data: articles } = useQuery({
    queryKey: ['recommended-articles', currentArticleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, cover_image_url, specialty')
        .neq('id', currentArticleId)
        .limit(4);
        
      if (error) throw error;
      return data as Issue[];
    },
  });

  if (!articles?.length) return null;

  return (
    <Card 
      className="p-6 mb-8 border"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <h3 className="text-lg font-medium mb-4" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
        Leituras recomendadas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="cursor-pointer group"
            onClick={() => navigate(`/article/${article.id}`)}
          >
            <div className="aspect-video mb-2 overflow-hidden rounded-lg">
              {article.cover_image_url ? (
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: CSS_VARIABLES.TERTIARY_BG }}
                >
                  <span className="text-sm" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>No image</span>
                </div>
              )}
            </div>
            <h4 
              className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2"
              style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}
            >
              {article.title}
            </h4>
            {article.specialty && (
              <p className="text-xs mt-1" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>
                {article.specialty}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
