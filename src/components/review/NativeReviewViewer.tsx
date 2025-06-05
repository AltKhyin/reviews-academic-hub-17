// ABOUTME: Main viewer component for native review content with enhanced dark theme
// Orchestrates block rendering, analytics, and user interactions

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Clock, Users, TrendingUp, Eye, ArrowLeft } from 'lucide-react';
import { EnhancedIssue } from '@/types/review';
import { useNativeReview } from '@/hooks/useNativeReview';
import { BlockRenderer } from './BlockRenderer';
import { ViewModeSwitcher } from '../article/ViewModeSwitcher';
import { PDFViewer } from '../pdf/PDFViewer';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NativeReviewViewerProps {
  issue: EnhancedIssue;
  className?: string;
}

export const NativeReviewViewer: React.FC<NativeReviewViewerProps> = ({
  issue,
  className
}) => {
  const { reviewData, isLoading, trackAnalytics, voteOnPoll } = useNativeReview(issue.id);
  const [viewMode, setViewMode] = useState<'native' | 'pdf' | 'dual'>('native');
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [sectionsViewed, setSectionsViewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Track review opened event
    trackAnalytics({
      eventType: 'review_opened',
      eventData: {
        review_type: issue.review_type,
        has_original_pdf: !!issue.article_pdf_url,
        total_blocks: reviewData?.blocks?.length || 0
      }
    });
  }, [issue.id, issue.review_type, issue.article_pdf_url, reviewData?.blocks?.length, trackAnalytics]);

  useEffect(() => {
    // Setup scroll progress tracking
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      setReadingProgress(progress);

      // Track reading progress milestones
      if (progress > 25 && progress < 30) {
        trackAnalytics({
          eventType: 'section_viewed',
          eventData: { milestone: '25%' },
          scrollDepth: progress
        });
      } else if (progress > 50 && progress < 55) {
        trackAnalytics({
          eventType: 'section_viewed',
          eventData: { milestone: '50%' },
          scrollDepth: progress
        });
      } else if (progress > 75 && progress < 80) {
        trackAnalytics({
          eventType: 'section_viewed',
          eventData: { milestone: '75%' },
          scrollDepth: progress
        });
      } else if (progress > 95) {
        trackAnalytics({
          eventType: 'review_completed',
          eventData: { 
            time_spent: Date.now() - startTime,
            sections_viewed: sectionsViewed.size
          },
          scrollDepth: progress,
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        });
      }
    };

    const throttledScroll = throttle(handleScroll, 250);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [trackAnalytics, startTime, sectionsViewed.size]);

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as 'native' | 'pdf' | 'dual');
    trackAnalytics({
      eventType: 'view_mode_changed',
      eventData: { 
        from_mode: viewMode,
        to_mode: mode
      }
    });
  };

  const handleBlockInteraction = (blockId: string, interactionType: string, data?: any) => {
    trackAnalytics({
      eventType: 'block_interaction',
      eventData: {
        block_id: blockId,
        interaction_type: interactionType,
        ...data
      }
    });
  };

  const handleSectionView = (blockId: string) => {
    setActiveSection(blockId);
    setSectionsViewed(prev => new Set([...prev, blockId]));
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#121212', color: '#ffffff' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4" 
               style={{ borderColor: '#3b82f6' }}></div>
          <p style={{ color: '#d1d5db' }}>Carregando revisão...</p>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: '#121212', color: '#ffffff' }}
      >
        <div className="text-center">
          <p style={{ color: '#d1d5db' }}>Revisão não encontrada</p>
        </div>
      </div>
    );
  }

  const { blocks } = reviewData;

  return (
    <div 
      className={cn("native-review-viewer", className)}
      style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh' }}
    >
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
                Revisão Nativa
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
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'native' && (
          <div className="native-content space-y-6">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                readonly={true}
              />
            ))}
            
            {blocks.length === 0 && (
              <Card 
                className="p-8 text-center shadow-lg"
                style={{ 
                  backgroundColor: '#1a1a1a',
                  borderColor: '#2a2a2a'
                }}
              >
                <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b7280' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
                  Conteúdo Nativo em Desenvolvimento
                </h3>
                <p className="mb-4" style={{ color: '#d1d5db' }}>
                  O conteúdo nativo desta revisão ainda não foi criado. 
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#ffffff' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                Revisão Nativa
              </h3>
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
                {blocks.map((block) => (
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#ffffff' }}>
                <FileText className="w-5 h-5" style={{ color: '#f59e0b' }} />
                Artigo Original
              </h3>
              {issue.article_pdf_url ? (
                <PDFViewer 
                  url={issue.article_pdf_url} 
                  title="Artigo Original"
                  className="max-h-[80vh]"
                />
              ) : (
                <Card 
                  className="p-6 text-center"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    borderColor: '#2a2a2a',
                    color: '#9ca3af'
                  }}
                >
                  <p>PDF do artigo original não disponível</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
