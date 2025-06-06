
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useNavigate } from 'react-router-dom';

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
    <Card className="p-6 border-white/10 bg-white/5">
      <h3 className="text-lg font-medium mb-4">Leituras recomendadas</h3>
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
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-sm text-gray-400">No image</span>
                </div>
              )}
            </div>
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h4>
            {article.specialty && (
              <p className="text-xs text-gray-400 mt-1">{article.specialty}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
