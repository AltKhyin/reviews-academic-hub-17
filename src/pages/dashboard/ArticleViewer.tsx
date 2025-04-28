
import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Issue } from '@/types/issue';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ArticleComments } from '@/components/article/ArticleComments';
import { RecommendedArticles } from '@/components/article/RecommendedArticles';
import { ExternalLectures } from '@/components/article/ExternalLectures';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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

  const handleViewModeChange = (value: string) => {
    if (value) setSearchParams({ view: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
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

      <div className="flex justify-end mb-4">
        <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
          <ToggleGroupItem value="review" aria-label="Show review only">
            Review Only
          </ToggleGroupItem>
          <ToggleGroupItem value="article" aria-label="Show article only">
            Article Only
          </ToggleGroupItem>
          <ToggleGroupItem value="dual" aria-label="Show both">
            Side by Side
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === 'dual' ? (
        <ResizablePanelGroup direction="horizontal" className="min-h-[800px]">
          <ResizablePanel defaultSize={50}>
            <PDFViewer 
              url={issue.pdf_url} 
              title="Review"
              fallbackContent={
                <p>Review PDF not available</p>
              }
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <PDFViewer 
              url={issue.article_pdf_url || ''} 
              title="Original Article"
              fallbackContent={
                <p>Original article PDF not available</p>
              }
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="min-h-[800px]">
          <PDFViewer 
            url={viewMode === 'review' ? issue.pdf_url : issue.article_pdf_url || ''} 
            title={viewMode === 'review' ? "Review" : "Original Article"}
            fallbackContent={
              <p>{viewMode === 'review' ? "Review" : "Original article"} PDF not available</p>
            }
          />
        </div>
      )}

      {/* Stack recommendations vertically instead of horizontally */}
      <div className="space-y-8">
        <RecommendedArticles currentArticleId={issue.id} />
        <ExternalLectures issueId={issue.id} />
      </div>
      
      <ArticleComments articleId={issue.id} />
    </div>
  );
};

export default ArticleViewer;
