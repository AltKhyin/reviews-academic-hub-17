
// ABOUTME: Articles grid section component for the homepage
// Displays articles in a responsive grid layout

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ArticlesGridSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-center">Carregando artigos...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles?.map((article) => (
        <div 
          key={article.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
            <p className="text-gray-600">{article.summary}</p>
            <Button 
              onClick={() => navigate(`/article/${article.id}`)}
              variant="link" 
              className="mt-4 p-0"
            >
              Ler mais →
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
