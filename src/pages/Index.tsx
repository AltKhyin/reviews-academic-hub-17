
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="text-center space-y-6 p-8 bg-white shadow-sm">
        <h1 className="text-4xl font-serif font-bold mb-4">Evidência Médica</h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Sua plataforma de referência para conteúdo médico baseado em evidências.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="font-medium"
          >
            Explorar Conteúdos
          </Button>
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
            size="lg"
            className="font-medium"
          >
            Acessar Conta
          </Button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center">Carregando artigos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>
    </div>
  );
};

export default Index;
