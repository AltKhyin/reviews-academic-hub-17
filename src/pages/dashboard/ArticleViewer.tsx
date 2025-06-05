
// ABOUTME: Article viewer component for displaying issues in read-only mode
// Handles both PDF and native review content types

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NativeReviewViewer } from '@/components/review/NativeReviewViewer';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { EnhancedIssue, TableOfContents } from '@/types/review';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [toc, setToc] = useState<TableOfContents | null>(null);

  // Fetch issue data
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['article-view', id],
    queryFn: async (): Promise<EnhancedIssue> => {
      if (!id) throw new Error('No article ID provided');

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
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
        review_type: data.review_type || 'pdf',
        article_pdf_url: data.article_pdf_url || '',
        pdf_url: data.pdf_url || ''
      };
    },
    enabled: !!id,
    retry: 1,
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
      
      if (issue.review_type === 'native') {
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

      setToc({ sections });
    }
  }, [issue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#3b82f6' }} />
          <p style={{ color: '#ffffff' }}>Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Erro ao carregar artigo</h2>
          <p className="text-gray-300 mb-4">Não foi possível carregar os dados do artigo.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // For native reviews, use NativeReviewViewer
  if (issue.review_type === 'native' || issue.review_type === 'hybrid') {
    return <NativeReviewViewer issue={issue} />;
  }

  // For PDF reviews, use PDFViewer
  if (issue.pdf_url) {
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
          
          <PDFViewer 
            url={issue.pdf_url} 
            title={issue.title}
            className="min-h-[80vh]"
          />
        </div>
      </div>
    );
  }

  // Fallback for issues without content
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>Conteúdo Indisponível</h2>
        <p className="text-gray-300 mb-4">Este artigo ainda não possui conteúdo disponível.</p>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ArticleViewer;
