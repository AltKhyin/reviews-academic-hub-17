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
import { useToast } from '@/hooks/use-toast';
import { LayoutContainer } from '@/components/layout/LayoutContainer';
import { DEFAULT_SIZE } from '@/types/layout';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'dual' | 'review' | 'original'>('review');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isValidatingId, setIsValidatingId] = useState(true);
  const [isValidId, setIsValidId] = useState<boolean | null>(null);
  
  // Enable scrolling on the main document
  useEffect(() => {
    document.body.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = 'auto'; // Reset on unmount
    };
  }, []);

  // ADVANCED ID VALIDATION
  // Check if the article/issue ID exists in the database before attempting to load content
  useEffect(() => {
    const validateEntityId = async () => {
      if (!id) {
        setIsValidId(false);
        setIsValidatingId(false);
        return;
      }

      try {
        console.log('Validating entity ID:', id);
        // We're looking in the issues table since that's the source table for our content
        const { data, error } = await supabase
          .from('issues')
          .select('id')
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error('ID validation error or not found:', error);
          setIsValidId(false);
        } else {
          console.log('Valid ID confirmed:', data.id);
          setIsValidId(true);
        }
      } catch (error) {
        console.error('Error in ID validation:', error);
        setIsValidId(false);
      } finally {
        setIsValidatingId(false);
      }
    };

    setIsValidatingId(true);
    validateEntityId();
  }, [id]);

  // ENHANCED DIAGNOSTICS: Log detailed information about URL and ID parameter
  useEffect(() => {
    console.log("--------- ARTICLE VIEWER DIAGNOSTICS ---------");
    console.log("ArticleViewer loaded with ID:", id);
    console.log("Current route:", window.location.pathname);
    console.log("Full URL:", window.location.href);
    
    // Validate UUID format
    const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log("Is ID a valid UUID format:", isValidUUID);
    
    // Check if we're in the correct route
    const isArticleRoute = window.location.pathname.includes('/article/');
    console.log("Is this an article route:", isArticleRoute);
    console.log("ID validation status:", isValidId);
    console.log("---------------------------------------------");
  }, [id, isValidId]);

  // Only fetch the data if we've confirmed the ID exists
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) {
        console.error("No issue ID provided");
        throw new Error('No issue ID provided');
      }
      
      console.log("FETCH ATTEMPT: Querying issues table with ID:", id);
      
      // IMPORTANT: We always query the issues table regardless of the path
      // This is the correct approach because all content is stored in the issues table
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching issue:`, error);
        console.log("Full error details:", JSON.stringify(error, null, 2));
        
        // Check if this is a "not found" error
        if (error.code === 'PGRST116') {
          console.error("No record found with the given ID");
          throw new Error(`Article/Issue not found`);
        }
        
        throw error;
      }
      
      if (!data) {
        console.error(`Issue not found with ID: ${id}`);
        throw new Error(`Issue not found`);
      }

      console.log(`DATA FOUND: Issue data retrieved successfully:`, data);
      return data as Issue;
    },
    retry: 1,
    enabled: !!id && isValidId === true, // Only run the query if we have a valid ID
    meta: {
      errorMessage: "Não foi possível carregar o artigo"
    }
  });

  // Add detailed error logging
  useEffect(() => {
    if (error) {
      console.error("QUERY ERROR: Details:", error);
      toast({
        title: "Erro ao carregar",
        description: `Não foi possível carregar o conteúdo. Erro: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Show loading state while we validate the ID
  if (isValidatingId) {
    return <div className="p-8 text-center">Verificando artigo...</div>;
  }

  // Show not found message if the ID is invalid
  if (isValidId === false) {
    return (
      <LayoutContainer
        size={DEFAULT_SIZE}
        padding={{ top: 8, right: 4, bottom: 8, left: 4 }}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <div className="space-y-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Artigo não encontrado</h2>
            <p className="text-muted-foreground">
              O conteúdo que você está procurando não existe ou foi removido.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              ID: {id || 'não especificado'}
            </p>
          </Card>
        </div>
      </LayoutContainer>
    );
  }

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
    // Note: Removed sidebar control since this app uses a different sidebar system
  };

  if (isLoading) {
    return (
      <LayoutContainer
        size={DEFAULT_SIZE}
        padding={{ top: 8, right: 4, bottom: 8, left: 4 }}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <div className="p-8 text-center">Carregando...</div>
      </LayoutContainer>
    );
  }

  if (error || !issue) {
    return (
      <LayoutContainer
        size={DEFAULT_SIZE}
        padding={{ top: 8, right: 4, bottom: 8, left: 4 }}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <div className="space-y-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Artigo não encontrado</h2>
            <p className="text-muted-foreground">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              ID: {id || 'não especificado'}
            </p>
          </Card>
        </div>
      </LayoutContainer>
    );
  }

  const hasOriginalArticle = !!issue.article_pdf_url;

  return (
    <LayoutContainer
      size={DEFAULT_SIZE}
      padding={{ top: 6, right: 4, bottom: 6, left: 4 }}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    >
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
        
        {/* Only render comments if we have a valid ID */}
        {isValidId && <ArticleComments articleId={issue.id} />}
      </div>
    </LayoutContainer>
  );
};

export default ArticleViewer;
