import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>PDF Viewer</CardDescription>
      </CardHeader>
      <CardContent>
        <iframe
          src={url}
          title="PDF Viewer"
          width="100%"
          height="600px"
        />
      </CardContent>
    </Card>
  );
};

const ArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<{
    id: string;
    title: string;
    description: string;
    specialty: string;
    pdf_url: string;
		article_pdf_url?: string | null;
    cover_image_url: string;
    published: boolean;
    published_at: string;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'review' | 'original'>('review');

  React.useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/issues/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIssue(data);
      } catch (error) {
        console.error("Could not fetch issue", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!issue) {
    return <div>Issue not found</div>;
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/edit')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{issue.title}</CardTitle>
          <CardDescription>{issue.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <img src={issue.cover_image_url} alt="Cover" className="w-full" />
          <p>Specialty: {issue.specialty}</p>
          <Button onClick={() => setViewMode(viewMode === 'review' ? 'original' : 'review')}>
            {viewMode === 'review' ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                View Original
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                View Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      {viewMode === 'review' ? (
        <PDFViewer url={issue.pdf_url} title={issue.title} />
      ) : (
        issue.article_pdf_url && (
          <PDFViewer url={issue.article_pdf_url} title={`Original: ${issue.title}`} />
        )
      )}
    </div>
  );
};

export default ArticleViewer;
