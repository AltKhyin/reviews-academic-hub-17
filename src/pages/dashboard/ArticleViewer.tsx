
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Issue } from '@/types/issue';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ArticleComments } from '@/components/article/ArticleComments';
import { RecommendedArticles } from '@/components/article/RecommendedArticles';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get('view') || 'review';

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) throw new Error('No issue ID provided');
      
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching issue:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Issue not found');
      }

      return data as Issue;
    },
    retry: 1,
    meta: {
      errorMessage: "Couldn't load the article"
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !issue) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Article not found</h2>
          <p className="text-muted-foreground">
            The article you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  const toggleViewMode = () => {
    const newMode = viewMode === 'review' ? 'dual' : 'review';
    setSearchParams({ view: newMode });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={toggleViewMode}>
          {viewMode === 'review' ? (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Show Both
            </>
          ) : (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Review Only
            </>
          )}
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

      <div className={`grid ${viewMode === 'dual' ? 'grid-cols-2 gap-6' : 'grid-cols-1'}`}>
        <PDFViewer 
          url={issue.pdf_url} 
          title="Review"
          fallbackContent={
            <p>Review PDF not available</p>
          }
        />
        {viewMode === 'dual' && (
          <PDFViewer 
            url={issue.article_pdf_url || ''} 
            title="Original Article"
            fallbackContent={
              <p>Original article PDF not available</p>
            }
          />
        )}
      </div>

      <RecommendedArticles currentArticleId={issue.id} />

      <ArticleComments articleId={issue.id} />
    </div>
  );
};

export default ArticleViewer;

