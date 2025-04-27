
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Issue } from '@/types/issue';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { toast } from '@/hooks/use-toast';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'review' | 'original'>('review');

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) throw new Error('No issue ID provided');
      
      console.log("Fetching issue with ID:", id);

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching issue:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Issue not found');
      }

      return data as Issue;
    },
    retry: 1,
    meta: {
      onError: (err: Error) => {
        console.error("Error in query:", err);
        toast({
          title: "Erro ao carregar edição",
          description: "Não foi possível carregar os dados desta edição.",
          variant: "destructive",
        });
      }
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (error || !issue) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Edição não encontrada</h2>
          <p className="text-muted-foreground">
            A edição que você está procurando não existe ou foi removida.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button onClick={() => setViewMode(viewMode === 'review' ? 'original' : 'review')}>
          {viewMode === 'review' ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Ver Original
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Ver Revisão
            </>
          )}
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">{issue.title}</h1>
          {issue.description && (
            <p className="text-gray-400 mb-4">{issue.description}</p>
          )}
          {issue.cover_image_url && (
            <img 
              src={issue.cover_image_url} 
              alt={issue.title} 
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
        </div>
      </Card>

      {viewMode === 'review' ? (
        <PDFViewer 
          url={issue.pdf_url} 
          title="Artigo Revisado" 
          fallbackContent={
            <p>PDF da revisão não disponível</p>
          }
        />
      ) : (
        <PDFViewer 
          url={issue.article_pdf_url || ''} 
          title="Artigo Original"
          fallbackContent={
            <p>PDF do artigo original não disponível</p>
          }
        />
      )}
    </div>
  );
};

export default ArticleViewer;
