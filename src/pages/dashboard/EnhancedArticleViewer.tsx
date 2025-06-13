// ABOUTME: Enhanced article viewer with native review and PDF support
// Integrates native review blocks, PDF viewer, and view mode switcher

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedIssue, ReviewBlock, BlockType } from '@/types/review';
import { NativeReviewViewer } from '@/components/review/NativeReviewViewer';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ViewModeSwitcher } from '@/components/article/ViewModeSwitcher';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { throttle } from '@/utils/throttle';

const EnhancedArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<EnhancedIssue | null>(null);
  const [blocks, setBlocks] = useState<ReviewBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewMode, setViewMode] = useState<'native' | 'pdf' | 'dual'>('native');
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [sectionsViewed, setSectionsViewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchArticleData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error('No article ID provided');
        }

        const { data: issueData, error: issueError } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();

        if (issueError) {
          console.error('Issue fetch error:', issueError);
          throw issueError;
        }

        if (!issueData) {
          throw new Error('Issue not found');
        }

        const enhancedIssue: EnhancedIssue = {
          id: issueData.id,
          title: issueData.title || '',
          description: issueData.description || '',
          authors: issueData.authors || '',
          specialty: issueData.specialty || '',
          year: issueData.year ? parseInt(issueData.year) : undefined,
          population: issueData.population || '',
          review_type: issueData.review_type || 'native',
          article_pdf_url: issueData.article_pdf_url || '',
          pdf_url: issueData.pdf_url || ''
        };

        setIssue(enhancedIssue);

        const { data: blocksData, error: blocksError } = await supabase
          .from('review_blocks')
          .select('*')
          .eq('issue_id', id)
          .order('sort_index', { ascending: true });

        if (blocksError) {
          console.error('Review blocks fetch error:', blocksError);
          throw blocksError;
        }

        const reviewBlocks: ReviewBlock[] = (blocksData || []).map(block => ({
          id: block.id,
          type: block.type as BlockType,
          content: block.payload || block.content || {},
          sort_index: block.sort_index,
          visible: block.visible
        }));

        setBlocks(reviewBlocks);
      } catch (err: any) {
        setError(err);
        console.error('Error fetching article data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      if (!document.documentElement) return;

      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setReadingProgress(progress);
    };

    const throttledScroll = throttle(handleScroll, 250);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as 'native' | 'pdf' | 'dual');
  };

  const handleBlockInteraction = (blockId: string, interactionType: string, data?: any) => {
    console.log(`Block ${blockId} interaction: ${interactionType}`, data);
  };

  const handleSectionView = (blockId: string) => {
    setActiveSection(blockId);
    setSectionsViewed(prev => new Set([...prev, blockId]));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <p style={{ color: '#ffffff' }}>Carregando artigo...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8 max-w-md mx-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <h2>Erro ao carregar artigo</h2>
            <p>Não foi possível carregar os dados do artigo.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Transform blocks to proper ReviewBlock format with type casting
  const reviewBlocks: ReviewBlock[] = blocks.map(block => ({
    id: block.id,
    type: block.type as BlockType,
    content: block.content,
    sort_index: block.sort_index,
    visible: block.visible
  }));

  return (
    <div className="enhanced-article-viewer" style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh' }}>
      {/* Progress Bar - Fixed at top */}
      <div
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}
      >
        <Progress
          value={readingProgress}
          className="h-1 rounded-none"
          style={{ backgroundColor: '#2a2a2a' }}
        />
      </div>

      {/* Header Section */}
      <div
        className="border-b py-6 mt-1"
        style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button asChild variant="ghost" style={{ color: '#d1d5db' }}>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>

          {/* View Mode Switcher */}
          <div className="mb-6">
            <ViewModeSwitcher
              currentMode={viewMode}
              onModeChange={handleViewModeChange}
              hasOriginalPDF={!!issue.article_pdf_url}
              hasNativeContent={true}
              hasPDFReview={!!issue.pdf_url}
            />
          </div>

          {/* Article Metadata */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: '#ffffff' }}>
              {issue.title}
            </h1>

            {issue.description && (
              <p className="text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
                {issue.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'native' && (
          <div className="native-content space-y-6">
            {reviewBlocks.length > 0 ? (
              reviewBlocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  readonly={true}
                  onInteraction={handleBlockInteraction}
                  onSectionView={handleSectionView}
                />
              ))
            ) : (
              <Card
                className="p-8 text-center shadow-lg"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: '#2a2a2a'
                }}
              >
                <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b7280' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
                  Conteúdo da Revisão em Desenvolvimento
                </h3>
                <p className="mb-4" style={{ color: '#d1d5db' }}>
                  O conteúdo desta revisão ainda não foi criado.
                  {issue.article_pdf_url && ' Você pode visualizar o artigo original enquanto isso.'}
                </p>
                {issue.article_pdf_url && (
                  <Button
                    onClick={() => handleViewModeChange('pdf')}
                    variant="outline"
                    style={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6'
                    }}
                  >
                    Ver Artigo Original (PDF)
                  </Button>
                )}
              </Card>
            )}
          </div>
        )}

        {viewMode === 'pdf' && issue.article_pdf_url && (
          <div className="pdf-content">
            <PDFViewer
              url={issue.article_pdf_url}
              title="Artigo Original"
              className="min-h-[80vh]"
            />
          </div>
        )}

        {viewMode === 'dual' && (
          <div className="dual-content grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="native-panel">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Revisão Estruturada
              </h3>
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                {reviewBlocks.length > 0 ? (
                  reviewBlocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      readonly={true}
                      onInteraction={handleBlockInteraction}
                      onSectionView={handleSectionView}
                    />
                  ))
                ) : (
                  <Card
                    className="p-6 text-center"
                    style={{
                      backgroundColor: '#1a1a1a',
                      borderColor: '#2a2a2a'
                    }}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: '#6b7280' }} />
                    <p className="text-sm" style={{ color: '#d1d5db' }}>
                      Conteúdo em desenvolvimento
                    </p>
                  </Card>
                )}
              </div>
            </div>

            <div className="pdf-panel">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Artigo Original
              </h3>
              {issue.article_pdf_url ? (
                <PDFViewer
                  url={issue.article_pdf_url}
                  title="Artigo Original"
                  className="h-[80vh]"
                />
              ) : (
                <Card
                  className="p-6 text-center h-[80vh] flex items-center justify-center"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#2a2a2a'
                  }}
                >
                  <div>
                    <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b7280' }} />
                    <p style={{ color: '#d1d5db' }}>
                      PDF original não disponível
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedArticleViewer;
