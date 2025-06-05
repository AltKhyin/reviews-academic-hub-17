
// ABOUTME: Enhanced article viewer with native review support
// Maintains backward compatibility while adding new native review capabilities

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NativeReviewViewer } from '@/components/review/NativeReviewViewer';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ViewModeSwitcher } from '@/components/article/ViewModeSwitcher';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { EnhancedIssue } from '@/types/review';
import { Link } from 'react-router-dom';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isAdmin, isEditor } = useAuth();
  const { toast } = useToast();

  // Fetch issue with enhanced type support
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: async (): Promise<EnhancedIssue> => {
      if (!id) throw new Error('Issue ID is required');

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Issue not found');

      // Ensure review_type is set (backward compatibility)
      const enhancedData = {
        ...data,
        review_type: data.review_type || 'pdf'
      } as EnhancedIssue;

      return enhancedData;
    },
    enabled: !!id
  });

  // Determine rendering mode based on content type and availability
  const renderingConfig = useMemo(() => {
    if (!issue) return { mode: 'loading' };

    // Check access permissions
    const hasAccess = issue.published || isAdmin || isEditor || profile?.role === 'admin' || profile?.role === 'editor';
    
    if (!hasAccess) {
      return { mode: 'unauthorized' };
    }

    // Determine content availability
    const hasNativeContent = issue.review_type === 'native' || issue.review_type === 'hybrid';
    const hasPdfContent = !!issue.pdf_url;
    const hasOriginalPdf = !!issue.article_pdf_url;

    if (hasNativeContent) {
      return {
        mode: 'native',
        hasOriginalPdf,
        hasPdfContent
      };
    } else if (hasPdfContent) {
      return {
        mode: 'pdf',
        hasOriginalPdf
      };
    } else {
      return { mode: 'no_content' };
    }
  }, [issue, isAdmin, isEditor, profile?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="p-8 max-w-md w-full text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Não foi possível carregar o artigo.'}
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="p-8 max-w-md w-full text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Artigo Não Encontrado</h2>
          <p className="text-gray-600 mb-4">
            O artigo solicitado não foi encontrado ou foi removido.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Handle unauthorized access
  if (renderingConfig.mode === 'unauthorized') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="p-8 max-w-md w-full text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">
            Este artigo ainda não foi publicado ou você não tem permissão para visualizá-lo.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Handle no content available
  if (renderingConfig.mode === 'no_content') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="p-8 max-w-md w-full text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conteúdo Indisponível</h2>
          <p className="text-gray-600 mb-4">
            O conteúdo deste artigo ainda não está disponível.
          </p>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
            {(isAdmin || isEditor) && (
              <Button asChild className="w-full">
                <Link to={`/edit/${issue.id}`}>
                  Editar Artigo
                </Link>
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Render based on content type
  switch (renderingConfig.mode) {
    case 'native':
      return <NativeReviewViewer issue={issue} />;
    
    case 'pdf':
    default:
      return (
        <div className="min-h-screen bg-gray-100">
          {/* Header with back navigation */}
          <div className="bg-white border-b border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <Button asChild variant="ghost">
                  <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                
                {renderingConfig.hasOriginalPdf && (
                  <ViewModeSwitcher
                    currentMode="pdf"
                    onModeChange={() => {}}
                    hasOriginalPDF={true}
                    hasNativeContent={false}
                  />
                )}
              </div>
              
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
                {issue.specialty && (
                  <p className="text-gray-600 mt-1">{issue.specialty}</p>
                )}
              </div>
            </div>
          </div>

          {/* PDF Content */}
          <div className="p-4">
            <PDFViewer 
              url={issue.pdf_url} 
              title={issue.title}
              className="max-w-7xl mx-auto"
            />
          </div>
        </div>
      );
  }
};

export default ArticleViewer;
