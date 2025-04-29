
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ViewModeSwitcher } from '@/components/article/ViewModeSwitcher';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ExternalLectures } from '@/components/article/ExternalLectures';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleActions } from '@/components/article/ArticleActions';
import { ArticleComments } from '@/components/article/ArticleComments';
import { ArticleReviewForm } from '@/components/article/ArticleReviewForm';
import { ArticleReviewList } from '@/components/article/ArticleReviewList';
import { useArticleView } from '@/hooks/useArticleView';
import { useIssueViews } from '@/hooks/useIssueViews';

type ViewMode = 'dual' | 'review' | 'original';

const ArticleViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('review');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const issueId = id; // For our use case, article ID is the same as issue ID
  const { recordIssueView } = useIssueViews();
  
  const {
    article,
    externalLectures,
    issue,
    isLoading,
    isReviewer,
    hasPermissionToReview,
    userReview,
    allReviews,
    refetchReviews
  } = useArticleView(id || '');

  useEffect(() => {
    if (issue?.id) {
      recordIssueView(issue.id);
    }
  }, [issue?.id, recordIssueView]);

  if (isLoading) {
    return <div className="p-8 flex justify-center">Carregando...</div>;
  }

  if (!article && !issue) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
        <p className="mt-2">O artigo que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Voltar para a página inicial
        </button>
      </div>
    );
  }

  const handleReviewFormToggle = () => {
    setShowReviewForm(!showReviewForm);
  };

  const hasOriginalPDF = !!issue?.article_pdf_url;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <ArticleHeader article={article || { id: issue?.id || '', title: issue?.title || '' }} />
        <div className="mt-4 md:mt-0 flex items-center">
          <ViewModeSwitcher 
            viewMode={viewMode} 
            onViewModeChange={(mode) => setViewMode(mode)} 
            hasOriginal={hasOriginalPDF}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {viewMode === 'pdf' || viewMode === 'review' ? (
            <PDFViewer file={issue?.pdf_url || ''} />
          ) : (
            <PDFViewer file={issue?.article_pdf_url || ''} />
          )}

          {/* Review Form */}
          {hasPermissionToReview && (
            <div className="mt-8 border-t border-gray-700 pt-8">
              <h2 className="text-xl font-medium mb-4">Revisão do Artigo</h2>
              <ArticleActions 
                articleId={id || ''} 
                onReviewClick={handleReviewFormToggle} 
                showReviewForm={showReviewForm}
              />
              
              {showReviewForm && (
                <ArticleReviewForm 
                  article={article}
                  onSubmitSuccess={() => {
                    refetchReviews();
                    setShowReviewForm(false);
                  }}
                  initialData={userReview}
                />
              )}
            </div>
          )}

          {/* Reviews List */}
          {allReviews && allReviews.length > 0 && (
            <ArticleReviewList reviews={allReviews} />
          )}

          {/* Comments Section */}
          <div className="mt-8 border-t border-gray-700 pt-8">
            <ArticleComments articleId={article?.id || issue?.id || ''} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          {externalLectures && externalLectures.length > 0 && (
            <div className="bg-gray-800/10 rounded-lg p-4 border border-gray-700/30">
              <h3 className="text-lg font-medium mb-4">Material Complementar</h3>
              <ExternalLectures issueId={issue?.id || ''} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleViewer;
