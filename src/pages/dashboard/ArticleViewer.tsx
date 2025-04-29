
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Issue } from '@/types/issue';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ArticleComments } from '@/components/article/ArticleComments';
import { RecommendedArticles } from '@/components/article/RecommendedArticles';
import { ExternalLectures } from '@/components/article/ExternalLectures';
import { ViewModeSwitcher } from '@/components/article/ViewModeSwitcher';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'dual' | 'review' | 'original'>('review');

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) throw new Error('No issue ID provided');
      
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
      errorMessage: "Couldn't load the article"
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !issue) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Artigo não encontrado</h2>
          <p className="text-muted-foreground">
            O artigo que você está procurando não existe ou foi removido.
          </p>
        </Card>
      </div>
    );
  }

  const hasOriginalArticle = !!issue.article_pdf_url;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
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

      <div className="flex justify-end mb-4">
        <ViewModeSwitcher 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          hasOriginal={hasOriginalArticle} 
        />
      </div>

      {viewMode === 'dual' ? (
        <div className="min-h-[800px]">
          <ResizablePanelGroup direction="horizontal" className="min-h-[800px]">
            <ResizablePanel defaultSize={50}>
              <PDFViewer 
                url={issue.pdf_url} 
                title="Revisão"
                fallbackContent={
                  <p>PDF de revisão não disponível</p>
                }
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <PDFViewer 
                url={issue.article_pdf_url || ''} 
                title="Artigo Original"
                fallbackContent={
                  <p>PDF do artigo original não disponível</p>
                }
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <div className="h-[800px]">
          <PDFViewer 
            url={viewMode === 'review' ? issue.pdf_url : issue.article_pdf_url || ''} 
            title={viewMode === 'review' ? "Revisão" : "Artigo Original"}
            fallbackContent={
              <p>{viewMode === 'review' ? "PDF de revisão" : "PDF do artigo original"} não disponível</p>
            }
          />
        </div>
      )}

      <div className="space-y-8">
        <RecommendedArticles currentArticleId={issue.id} />
        <ExternalLectures issueId={issue.id} />
      </div>
      
      <ArticleComments articleId={issue.id} />
    </div>
  );
};

export default ArticleViewer;
