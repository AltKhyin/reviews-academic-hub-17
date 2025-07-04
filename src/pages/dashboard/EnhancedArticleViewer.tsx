// ABOUTME: Enhanced article viewer with unified controls and structured sections
// Implements the 4-section layout: Header, Review Content, Recommendations, Comments

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, AlertTriangle, Clock, Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNativeReview } from '@/hooks/useNativeReview';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { UnifiedViewerControls } from '@/components/article/UnifiedViewerControls';
import { FloatingViewerControls } from '@/components/article/FloatingViewerControls';
import { MinimalFloatingControls } from '@/components/article/MinimalFloatingControls';
import { EnhancedPDFViewer } from '@/components/article/EnhancedPDFViewer';
import { RecommendedArticles } from '@/components/article/RecommendedArticles';
import { ExternalLectures } from '@/components/article/ExternalLectures';
import { ArticleComments } from '@/components/article/ArticleComments';
import { ArticleActions } from '@/components/article/ArticleActions';
import { EnhancedIssue, BlockType } from '@/types/review';
import { cn } from '@/lib/utils';

const EnhancedArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // View and reading mode state
  const [viewMode, setViewMode] = useState<'native' | 'pdf' | 'dual'>('native');
  const [readingMode, setReadingMode] = useState<'normal' | 'browser-fullscreen' | 'system-fullscreen'>('normal');
  const [startTime] = useState(Date.now());
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  const [showMinimalControls, setShowMinimalControls] = useState(false);

  // Fetch issue data
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['article-view', id],
    queryFn: async (): Promise<EnhancedIssue> => {
      if (!id) {
        throw new Error('No article ID provided');
      }

      console.log('Fetching article data for ID:', id);

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Article fetch error:', error);
        toast({
          title: "Erro ao carregar artigo",
          description: "Não foi possível carregar os dados do artigo.",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        throw new Error('Article not found');
      }

      return {
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        authors: data.authors || '',
        specialty: data.specialty || '',
        year: data.year ? parseInt(data.year) : undefined,
        population: data.population || '',
        review_type: (data.review_type || 'native') as 'native' | 'pdf' | 'mixed',
        article_pdf_url: data.article_pdf_url || '',
        pdf_url: data.pdf_url || ''
      };
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      console.log('Article fetch retry:', failureCount, error);
      return failureCount < 2;
    },
  });

  // Get review data for native content
  const { reviewData, trackAnalytics, voteOnPoll } = useNativeReview(issue?.id || '');

  const typedBlocks = useMemo(() => {
    if (!reviewData?.blocks) return [];
    return reviewData.blocks.map(b => ({ ...b, type: b.type as BlockType }));
  }, [reviewData?.blocks]);

  // Handle scroll detection for floating controls - simplified to trigger on any scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      const moderateScroll = window.scrollY > 300;
      
      // Show minimal controls immediately when any scroll is detected
      setShowMinimalControls(scrolled);
      setShowFloatingControls(moderateScroll && !scrolled); // Only show standard controls in the middle range
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle reading mode changes with improved layout preservation
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && readingMode !== 'normal') {
        setReadingMode('normal');
      }
    };

    if (readingMode === 'browser-fullscreen') {
      document.addEventListener('keydown', handleEscapeKey);
      // Don't hide overflow for dual/pdf modes to preserve layout
      if (viewMode === 'native') {
        document.body.style.overflow = 'hidden';
      }
    } else if (readingMode === 'system-fullscreen') {
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [readingMode, viewMode]);

  // Handle system fullscreen
  useEffect(() => {
    if (readingMode === 'system-fullscreen') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          setReadingMode('browser-fullscreen'); // Fallback to browser fullscreen
        });
      }
    } else if (document.fullscreenElement && readingMode === 'normal') {
      document.exitFullscreen();
    }
  }, [readingMode]);

  const handleViewModeChange = (mode: 'native' | 'pdf' | 'dual') => {
    setViewMode(mode);
    if (trackAnalytics) {
      trackAnalytics({
        eventType: 'view_mode_changed',
        eventData: { 
          from_mode: viewMode,
          to_mode: mode
        }
      }).catch(console.error);
    }
  };

  const handleReadingModeChange = (mode: 'normal' | 'browser-fullscreen' | 'system-fullscreen') => {
    setReadingMode(mode);
    if (trackAnalytics) {
      trackAnalytics({
        eventType: 'reading_mode_changed',
        eventData: { 
          from_mode: readingMode,
          to_mode: mode
        }
      }).catch(console.error);
    }
  };

  // Determine container classes based on reading mode and view mode
  const getContainerClasses = () => {
    if (readingMode === 'browser-fullscreen') {
      return "fixed inset-0 z-40 bg-gray-900 overflow-y-auto";
    }
    return "enhanced-article-viewer";
  };

  const getContentMaxWidth = () => {
    // For dual and pdf modes in reading modes, use full width to prevent popup behavior
    if ((viewMode === 'dual' || viewMode === 'pdf') && readingMode !== 'normal') {
      return "max-w-full";
    }
    return "max-w-6xl";
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#121212', color: '#ffffff' }}
      >
        <Card className="p-8" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#3b82f6' }} />
            <p style={{ color: '#ffffff' }}>Carregando artigo...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#121212', color: '#ffffff' }}
      >
        <Card className="p-8 max-w-md mx-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Erro ao carregar artigo</h2>
            <p className="text-red-200 mb-4">
              Não foi possível carregar os dados do artigo.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={getContainerClasses()} style={{ backgroundColor: '#121212', color: '#ffffff' }}>
      {/* Section 1: Header - Always scrollable */}
      <div 
        className="border-b py-6"
        style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}
      >
        <div className={cn(getContentMaxWidth(), "mx-auto px-4 sm:px-6 lg:px-8")}>
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              onClick={() => readingMode !== 'normal' ? setReadingMode('normal') : navigate('/dashboard')}
              variant="ghost" 
              style={{ color: '#d1d5db' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {readingMode !== 'normal' ? 'Sair do Modo Leitura' : 'Voltar ao Dashboard'}
            </Button>
          </div>

          {/* Article Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge 
                variant="outline" 
                className="px-3 py-1"
                style={{ 
                  backgroundColor: '#1e3a8a',
                  borderColor: '#3b82f6',
                  color: '#93c5fd'
                }}
              >
                {issue.specialty}
              </Badge>
              {issue.year && (
                <span className="flex items-center gap-1" style={{ color: '#d1d5db' }}>
                  <Clock className="w-4 h-4" />
                  {issue.year}
                </span>
              )}
              {issue.population && (
                <span className="flex items-center gap-1" style={{ color: '#d1d5db' }}>
                  <Users className="w-4 h-4" />
                  {issue.population}
                </span>
              )}
              <span className="flex items-center gap-1" style={{ color: '#d1d5db' }}>
                <Eye className="w-4 h-4" />
                Revisão
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: '#ffffff' }}>
              {issue.title}
            </h1>

            {issue.description && (
              <p className="text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
                {issue.description}
              </p>
            )}

            {issue.authors && (
              <div className="text-sm" style={{ color: '#d1d5db' }}>
                <strong>Autores do estudo original:</strong> {issue.authors}
              </div>
            )}

            {/* Article Actions - Fix: Remove invalid props */}
            <ArticleActions />
          </div>
        </div>
      </div>

      {/* Section 2: Review Content with Unified Controls */}
      <div className={cn(getContentMaxWidth(), "mx-auto px-4 sm:px-6 lg:px-8 py-8")}>
        {/* Static Unified Viewer Controls - only shown when not scrolled */}
        {!showMinimalControls && (
          <UnifiedViewerControls
            currentViewMode={viewMode}
            currentReadingMode={readingMode}
            onViewModeChange={handleViewModeChange}
            onReadingModeChange={handleReadingModeChange}
            hasOriginalPDF={!!issue.article_pdf_url}
            hasNativeContent={true}
            className="mb-8"
          />
        )}

        {/* Content Area with improved reading mode support */}
        {viewMode === 'native' && (
          <div className="native-content space-y-6">
            {typedBlocks && typedBlocks.length > 0 ? (
              typedBlocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  readonly={true}
                  onInteraction={(blockId, type, data) => {
                    if (trackAnalytics) {
                      trackAnalytics({
                        eventType: 'block_interaction',
                        eventData: { block_id: blockId, interaction_type: type, ...data }
                      }).catch(console.error);
                    }
                  }}
                />
              ))
            ) : (
              <Card 
                className="p-8 text-center"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <p style={{ color: '#d1d5db' }}>
                  O conteúdo desta revisão ainda não foi criado.
                </p>
              </Card>
            )}
          </div>
        )}

        {viewMode === 'pdf' && issue.article_pdf_url && (
          <div className="pdf-content">
            <EnhancedPDFViewer 
              url={issue.article_pdf_url} 
              title="Artigo Original"
              height="tall"
              readingMode={readingMode}
            />
          </div>
        )}

        {viewMode === 'dual' && (
          <div className={cn(
            "dual-content grid gap-6",
            readingMode === 'normal' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 xl:grid-cols-2"
          )}>
            <div className="native-panel">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Revisão
              </h3>
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                {typedBlocks?.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    readonly={true}
                    className="text-sm"
                  />
                ))}
              </div>
            </div>
            
            <div className="pdf-panel">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Artigo Original
              </h3>
              <div className={cn(
                readingMode !== 'normal' ? "h-[80vh]" : "max-h-[80vh]"
              )}>
                <EnhancedPDFViewer 
                  url={issue.article_pdf_url} 
                  title="Artigo Original"
                  height="tall"
                  readingMode={readingMode}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Recommendations - Single column, full width, no titles */}
      {readingMode === 'normal' && (
        <div className={cn(getContentMaxWidth(), "mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t")} style={{ borderColor: '#2a2a2a' }}>
          <div className="space-y-6">
            <RecommendedArticles currentArticleId={issue.id} />
            <ExternalLectures issueId={issue.id} />
          </div>
        </div>
      )}

      {/* Section 4: Comments - Always show in normal mode */}
      {readingMode === 'normal' && (
        <div className={cn(getContentMaxWidth(), "mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t")} style={{ borderColor: '#2a2a2a' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#ffffff' }}>
            Comentários
          </h2>
          <ArticleComments articleId={issue.id} />
        </div>
      )}

      {/* Standard Floating Controls - Show when scrolled moderately but not showing minimal */}
      {showFloatingControls && !showMinimalControls && (
        <FloatingViewerControls
          currentViewMode={viewMode}
          currentReadingMode={readingMode}
          onViewModeChange={handleViewModeChange}
          onReadingModeChange={handleReadingModeChange}
          hasOriginalPDF={!!issue.article_pdf_url}
          hasNativeContent={true}
        />
      )}

      {/* Minimal Floating Controls - Show as soon as user scrolls */}
      {showMinimalControls && (
        <MinimalFloatingControls
          currentViewMode={viewMode}
          currentReadingMode={readingMode}
          onViewModeChange={handleViewModeChange}
          onReadingModeChange={handleReadingModeChange}
          hasOriginalPDF={!!issue.article_pdf_url}
          hasNativeContent={true}
        />
      )}
    </div>
  );
};

export default EnhancedArticleViewer;
