
// ABOUTME: Migrated article viewer using coordinated data access patterns
// Replaces individual API calls with standardized data hooks - PHASE B MIGRATION

import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedIssue } from '@/types/review';
import EnhancedArticleViewer from './EnhancedArticleViewer';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { architecturalGuards } from '@/core/ArchitecturalGuards';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // ARCHITECTURAL FIX: Use coordinated data access instead of individual query
  const { data: pageData, loading: dataLoading, error: dataError } = useStandardizedData.usePageData(`/article/${id}`);

  // PERFORMANCE MONITORING: Track coordination usage
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const violations = architecturalGuards.flagArchitecturalViolations();
      const viewerViolations = violations.filter(v => v.component.includes('ArticleViewer'));
      
      if (viewerViolations.length > 0) {
        console.warn('🚨 ArticleViewer: Architectural violations detected:', viewerViolations);
      } else {
        console.log('✅ ArticleViewer: Using coordinated data access successfully');
      }
    }
  }, []);

  // Extract issue from coordinated page data
  const issue = pageData?.contentData?.currentIssue;

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#3b82f6' }} />
            <p style={{ color: '#ffffff' }}>Carregando artigo via sistema coordenado...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (dataError || !issue) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="p-8 max-w-md mx-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Erro ao carregar artigo</h2>
            <p className="text-red-200 mb-4">
              Não foi possível carregar os dados do artigo via sistema coordenado.
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

  // Convert coordinated data to EnhancedIssue format
  const enhancedIssue: EnhancedIssue = {
    id: issue.id,
    title: issue.title || '',
    description: issue.description || '',
    authors: issue.authors || '',
    specialty: issue.specialty || '',
    year: issue.year ? parseInt(issue.year) : undefined,
    population: issue.population || '',
    review_type: issue.review_type || 'native',
    article_pdf_url: issue.article_pdf_url || '',
    pdf_url: issue.pdf_url || ''
  };

  // Route to enhanced viewer for native and hybrid content (our new default)
  if (enhancedIssue.review_type === 'native' || enhancedIssue.review_type === 'hybrid' || !enhancedIssue.review_type) {
    return <EnhancedArticleViewer />;
  }

  // Legacy PDF review support (minimal implementation)
  if (enhancedIssue.review_type === 'pdf' && enhancedIssue.pdf_url) {
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
            url={enhancedIssue.pdf_url} 
            title={enhancedIssue.title}
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
