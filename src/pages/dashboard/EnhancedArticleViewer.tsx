
// ABOUTME: Enhanced article viewer with proper type conversion and string ID support
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReviewBlock } from '@/types/review';
import { convertDatabaseIdToString, sanitizeBlockType, sanitizeReviewType, parseJsonSafely } from '@/utils/typeGuards';
import { NativeEditor } from '@/components/editor/NativeEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Issue {
  id: string;
  title: string;
  description?: string;
  authors?: string;
  specialty: string;
  year?: number;
  population?: string;
  review_type: 'native' | 'pdf' | 'mixed';
  article_pdf_url?: string;
  pdf_url?: string;
}

const EnhancedArticleViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [blocks, setBlocks] = useState<ReviewBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('No article ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load issue data
        const { data: issueData, error: issueError } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();

        if (issueError) {
          console.error('Error loading issue:', issueError);
          setError('Failed to load article');
          return;
        }

        if (!issueData) {
          setError('Article not found');
          return;
        }

        const sanitizedIssue: Issue = {
          id: issueData.id,
          title: issueData.title || '',
          description: issueData.description || '',
          authors: issueData.authors || '',
          specialty: issueData.specialty || '',
          year: issueData.year ? parseInt(issueData.year) : undefined,
          population: issueData.population || '',
          review_type: sanitizeReviewType(issueData.review_type),
          article_pdf_url: issueData.article_pdf_url || '',
          pdf_url: issueData.pdf_url || ''
        };

        setIssue(sanitizedIssue);

        // Load blocks data
        const { data: reviewBlocks, error: blocksError } = await supabase
          .from('review_blocks')
          .select('*')
          .eq('issue_id', id)
          .order('sort_index');

        if (blocksError) {
          console.error('Error loading blocks:', blocksError);
          // Don't fail completely if blocks can't be loaded
          setBlocks([]);
        } else {
          // Convert database blocks to ReviewBlock format with proper type safety
          const convertedBlocks: ReviewBlock[] = (reviewBlocks || []).map(block => ({
            id: convertDatabaseIdToString(block.id),
            type: sanitizeBlockType(block.type),
            content: parseJsonSafely(block.payload, {}),
            sort_index: block.sort_index,
            visible: Boolean(block.visible),
            meta: parseJsonSafely(block.meta, {}),
          }));

          setBlocks(convertedBlocks);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleUpdateBlock = useMemo(() => (blockId: string, updates: Partial<ReviewBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  }, []);

  const handleDeleteBlock = useMemo(() => (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId]);

  const handleMoveBlock = useMemo(() => (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === blockId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      
      // Update sort indices
      newBlocks.forEach((block, idx) => {
        block.sort_index = idx;
      });
      
      return newBlocks;
    });
  }, []);

  const handleAddBlock = useMemo(() => (type: any, position?: number) => {
    // This would be implemented for editing mode
    console.log('Add block:', type, position);
  }, []);

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
              {error || 'Não foi possível carregar os dados do artigo.'}
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

  return (
    <div className="enhanced-article-viewer" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost" style={{ color: '#d1d5db' }}>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
            {issue.title}
          </h1>
          
          {issue.authors && (
            <p className="text-lg mb-2" style={{ color: '#d1d5db' }}>
              {issue.authors}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-sm" style={{ color: '#9ca3af' }}>
            <span>{issue.specialty}</span>
            {issue.year && <span>{issue.year}</span>}
            {issue.population && <span>{issue.population}</span>}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <NativeEditor
            blocks={blocks}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onMoveBlock={handleMoveBlock}
            onAddBlock={handleAddBlock}
            activeBlockId={activeBlockId}
            onActiveBlockChange={setActiveBlockId}
            readonly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedArticleViewer;
