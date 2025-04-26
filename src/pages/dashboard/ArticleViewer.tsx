
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArticleData } from '@/types/article';
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ViewModeSwitcher } from '@/components/article/ViewModeSwitcher';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ArticleComments } from '@/components/article/ArticleComments';
import { supabase } from '@/integrations/supabase/client';

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [viewMode, setViewMode] = useState<'dual' | 'review' | 'original'>('review');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Transform the issue data to match ArticleData structure
          const articleData: ArticleData = {
            id: data.id,
            title: data.title,
            author: 'Author Not Available', // This would come from a join in a real implementation
            journal: data.specialty || 'Journal Not Available',
            year: new Date(data.created_at).getFullYear().toString(),
            reviewDate: new Date(data.updated_at).toLocaleDateString(),
            reviewedBy: 'Reviewer Not Available', // This would come from a join in a real implementation
            reviewContent: data.description || 'No review content available',
            pdf_url: data.pdf_url,
            article_pdf_url: data.article_pdf_url || undefined,
          };
          
          setArticle(articleData);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: "Error",
          description: "Failed to load article details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading article...</div>;
  }

  if (!article) {
    return <div className="p-8">Article not found.</div>;
  }

  const handleViewModeChange = (mode: 'dual' | 'review' | 'original') => {
    setViewMode(mode);
  };

  const pdfUrl = viewMode === 'review' ? article.pdf_url : article.article_pdf_url;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/homepage')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Articles
      </Button>

      <ArticleHeader article={article} />
      
      <ViewModeSwitcher 
        viewMode={viewMode} 
        onViewModeChange={handleViewModeChange} 
        hasOriginal={!!article.article_pdf_url} 
      />
      
      <Tabs defaultValue="pdf" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pdf" className="bg-white/5 p-0 rounded-md overflow-hidden">
          {pdfUrl ? (
            <Card className="border-white/10">
              <PDFViewer url={pdfUrl} />
            </Card>
          ) : (
            <div className="p-8 text-center">PDF not available for this view mode.</div>
          )}
        </TabsContent>
        
        <TabsContent value="content">
          <ArticleContent article={article} />
        </TabsContent>
        
        <TabsContent value="comments">
          <ArticleComments articleId={article.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArticleViewer;
