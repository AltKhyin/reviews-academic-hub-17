
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Maximize, BookOpen, SplitSquareVertical, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Issue } from '@/types/issue';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ArticleComments } from '@/components/article/ArticleComments';
import { RecommendedArticles } from '@/components/article/RecommendedArticles';
import { ExternalLectures } from '@/components/article/ExternalLectures';
import { ViewModeSwitcher } from '@/components/article/ViewModeSwitcher';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useSidebar } from '@/components/ui/sidebar';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'dual' | 'review' | 'original'>('review');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Enable scrolling on the main document
  useEffect(() => {
    document.body.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = 'auto'; // Reset on unmount
    };
  }, []);

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

  const handleFullScreenDual = () => {
    const container = document.getElementById('dual-pdf-container');
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };
  
  const handleReadingMode = () => {
    setIsReadingMode(!isReadingMode);
    
    // Automatically hide sidebar when entering reading mode
    if (!isReadingMode) {
      setSidebarOpen(false);
    }
  };

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

      <div className="flex justify-between mb-4">
        <ViewModeSwitcher 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          hasOriginal={hasOriginalArticle} 
        />
        
        {viewMode === 'dual' && hasOriginalArticle && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReadingMode}>
              <BookOpen size={16} className="mr-1" />
              <span>Modo de leitura</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullScreenDual}>
              <Maximize size={16} className="mr-1" />
              <span>Tela cheia</span>
            </Button>
          </div>
        )}
      </div>

      <div className={`h-[800px] w-full flex flex-col ${isReadingMode ? 'fixed inset-0 z-50 bg-[#111111] p-4 rounded-lg' : ''}`}>
        {viewMode === 'dual' ? (
          <ResizablePanelGroup 
            id="dual-pdf-container" 
            direction="horizontal" 
            className={`h-[800px] w-full flex-grow ${isReadingMode ? 'h-full' : ''}`}
          >
            <ResizablePanel defaultSize={50} className="h-full">
              <div className="h-full bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation flex flex-col">
                <h2 className="font-serif text-xl font-medium mb-4">Revisão</h2>
                <div className="w-full flex-grow bg-[#121212] rounded-md overflow-hidden">
                  {issue.pdf_url && issue.pdf_url !== 'placeholder.pdf' ? (
                    <iframe
                      src={issue.pdf_url}
                      className="w-full h-full rounded-md"
                      title="Revisão"
                      style={{ display: 'block' }} // Ensures proper rendering in all browsers
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <p className="text-gray-400 mb-4 text-center">PDF de revisão não disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} className="h-full">
              <div className="h-full bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation flex flex-col">
                <h2 className="font-serif text-xl font-medium mb-4">Artigo Original</h2>
                <div className="w-full flex-grow bg-[#121212] rounded-md overflow-hidden">
                  {issue.article_pdf_url && issue.article_pdf_url !== 'placeholder.pdf' ? (
                    <iframe
                      src={issue.article_pdf_url}
                      className="w-full h-full rounded-md"
                      title="Artigo Original"
                      style={{ display: 'block' }} // Ensures proper rendering in all browsers
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <p className="text-gray-400 mb-4 text-center">PDF do artigo original não disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-[800px] w-full flex-grow">
            <PDFViewer 
              url={viewMode === 'review' ? issue.pdf_url : issue.article_pdf_url || ''} 
              title={viewMode === 'review' ? "Revisão" : "Artigo Original"}
              fallbackContent={
                <p>{viewMode === 'review' ? "PDF de revisão" : "PDF do artigo original"} não disponível</p>
              }
            />
          </div>
        )}
        
        {isReadingMode && (
          <>
            <div className="absolute top-3 right-3 z-50">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleReadingMode}
                className="bg-gray-700/60 hover:bg-gray-600"
              >
                Fechar
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800/70 px-4 py-2 rounded-full flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('original')}
                disabled={!hasOriginalArticle}
                className={`p-2 rounded-full ${viewMode === 'original' ? 'bg-gray-700/70' : 'bg-transparent'}`}
              >
                <FileText size={20} className={`${viewMode === 'original' ? 'text-white' : 'text-gray-400'} ${!hasOriginalArticle ? 'opacity-50' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('dual')}
                disabled={!hasOriginalArticle}
                className={`p-2 rounded-full ${viewMode === 'dual' ? 'bg-gray-700/70' : 'bg-transparent'}`}
              >
                <SplitSquareVertical size={20} className={`${viewMode === 'dual' ? 'text-white' : 'text-gray-400'} ${!hasOriginalArticle ? 'opacity-50' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('review')}
                className={`p-2 rounded-full ${viewMode === 'review' ? 'bg-gray-700/70' : 'bg-transparent'}`}
              >
                <BookOpen size={20} className={viewMode === 'review' ? 'text-white' : 'text-gray-400'} />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-8 mt-8">
        <RecommendedArticles currentArticleId={issue.id} />
        <ExternalLectures issueId={issue.id} />
      </div>
      
      <ArticleComments articleId={issue.id} />
    </div>
  );
};

export default ArticleViewer;
