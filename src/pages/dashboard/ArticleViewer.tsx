
// ABOUTME: Article viewer router - delegates to appropriate viewer based on content type
// Handles routing logic and maintains backward compatibility

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedIssue } from '@/types/review';
import EnhancedArticleViewer from './EnhancedArticleViewer';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch basic issue data to determine routing
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['article-routing', id],
    queryFn: async (): Promise<EnhancedIssue> => {
      if (!id) {
        throw new Error('No article ID provided');
      }

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Article fetch error:', error);
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
        review_type: data.review_type || 'native',
        article_pdf_url: data.article_pdf_url || '',
        pdf_url: data.pdf_url || ''
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8 max-w-md mx-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Erro ao carregar artigo</h2>
            <p className="text-red-200 mb-4">
              Não foi possível carregar os dados do artigo.
            </p>
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

  // Route to enhanced viewer for native and hybrid content (our new default)
  if (issue.review_type === 'native' || issue.review_type === 'hybrid' || !issue.review_type) {
    return <EnhancedArticleViewer />;
  }

  // Legacy PDF review support (minimal implementation)
  if (issue.review_type === 'pdf' && issue.pdf_url) {
    return (
      <div className="article-viewer" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Button asChild variant="ghost" style={{ color: '#d1d5db' }}>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
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
  return <EnhancedArticleViewer />;
};

export default ArticleViewer;
