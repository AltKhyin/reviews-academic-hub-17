
// ABOUTME: Enhanced article viewer with comprehensive native review support
// Handles routing, error states, and seamless native/PDF content switching

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertTriangle, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NativeReviewViewer } from '@/components/review/NativeReviewViewer';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { EnhancedIssue, TableOfContents } from '@/types/review';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [toc, setToc] = useState<TableOfContents | null>(null);

  // Fetch issue data with enhanced error handling
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

      console.log('Article data fetched:', {
        id: data.id,
        title: data.title,
        review_type: data.review_type,
        has_pdf: !!data.pdf_url,
        has_article_pdf: !!data.article_pdf_url
      });

      return {
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        authors: data.authors || '',
        specialty: data.specialty || '',
        year: data.year ? parseInt(data.year) : undefined,
        population: data.population || '',
        review_type: data.review_type || 'native', // Default to native for new content
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

  useEffect(() => {
    if (issue) {
      // Generate TOC from issue data
      const sections = [];
      
      if (issue.description) {
        sections.push({
          id: 'overview',
          title: 'Visão Geral',
          level: 1
        });
      }
      
      // Prioritize native content
      if (issue.review_type === 'native' || issue.review_type === 'hybrid') {
        sections.push({
          id: 'content',
          title: 'Conteúdo da Revisão',
          level: 1
        });
      }
      
      if (issue.article_pdf_url) {
        sections.push({
          id: 'original',
          title: 'Artigo Original',
          level: 1
        });
      }

      // Legacy PDF support
      if (issue.review_type === 'pdf' && issue.pdf_url) {
        sections.push({
          id: 'pdf-review',
          title: 'Revisão PDF',
          level: 1
        });
      }

      setToc({ sections });
    }
  }, [issue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#3b82f6' }} />
            <p style={{ color: '#ffffff' }}>Carregando artigo...</p>
            <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>
              Aguarde enquanto carregamos o conteúdo
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !issue) {
    console.error('Article viewer error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8 max-w-md mx-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Erro ao carregar artigo</h2>
            <p className="text-red-200 mb-4">
              Não foi possível carregar os dados do artigo.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                Tentar novamente
              </Button>
            </div>
            {error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-300">Detalhes do erro</summary>
                <pre className="mt-2 text-xs text-red-200 bg-red-500/20 p-2 rounded overflow-auto">
                  {error?.message || 'Erro desconhecido'}
                </pre>
              </details>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Route to native review viewer for native and hybrid content
  if (issue.review_type === 'native' || issue.review_type === 'hybrid' || !issue.review_type) {
    console.log('Rendering native review viewer for:', issue.id);
    return <NativeReviewViewer issue={issue} />;
  }

  // Legacy PDF review support
  if (issue.review_type === 'pdf' && issue.pdf_url) {
    console.log('Rendering PDF review for:', issue.id);
    return (
      <div className="article-viewer" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              style={{ color: '#d1d5db' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
          
          <div className="mb-6">
            <Card className="p-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h2 className="font-semibold" style={{ color: '#ffffff' }}>{issue.title}</h2>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>
                    Revisão em formato PDF - Conteúdo legado
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <PDFViewer 
            url={issue.pdf_url} 
            title={issue.title}
            className="min-h-[80vh]"
          />
        </div>
      </div>
    );
  }

  // Fallback for issues without proper content
  console.log('No content available for issue:', issue.id, issue.review_type);
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
      <Card className="p-8 max-w-md mx-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b7280' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Conteúdo Indisponível
          </h2>
          <p className="mb-4" style={{ color: '#d1d5db' }}>
            Este artigo ainda não possui conteúdo disponível para visualização.
          </p>
          <div className="space-y-2 text-sm" style={{ color: '#9ca3af' }}>
            <p>ID do artigo: {issue.id}</p>
            <p>Tipo de revisão: {issue.review_type || 'não definido'}</p>
            <p>PDF disponível: {issue.pdf_url ? 'Sim' : 'Não'}</p>
            <p>PDF original: {issue.article_pdf_url ? 'Sim' : 'Não'}</p>
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArticleViewer;
