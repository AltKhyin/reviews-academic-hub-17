// ABOUTME: Refactored issue editor with improved component separation
// Main editor page using focused sub-components for better maintainability

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { Review, ReviewBlock, BlockType } from '@/types/review';
import { IssueHeader } from './components/issue/IssueHeader';
import { IssueActionButtons } from './components/issue/IssueActionButtons';
import { ContentTypeSelector } from './components/editor/ContentTypeSelector';
import { EditorTabs } from './components/editor/EditorTabs';
import { useIssueEditor } from './hooks/useIssueEditor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transformBlocksToReview, transformReviewToBlocks } from '@/lib/editor-adapter';

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewIssue = id === 'new';
  
  const [contentType, setContentType] = useState<'pdf' | 'native'>('pdf');
  
  const { 
    formValues,
    setFormValues,
    isSubmitting, 
    onSubmit,
    handleDelete,
    togglePublish,
    toggleFeatured
  } = useIssueEditor(isNewIssue ? undefined : id);

  // Fetch issue data only if editing existing issue
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue-edit', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;

      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          toast({
            title: "Error loading issue",
            description: "Could not load the issue data. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
        
        return data as Issue;
      } catch (err) {
        throw err;
      }
    },
    enabled: !isNewIssue && !!id,
    retry: 1,
  });

  // Fetch native blocks if this is a native review
  const { data: fetchedBlocks } = useQuery({
    queryKey: ['review-blocks', id],
    queryFn: async () => {
      if (!id || isNewIssue) return [];
      
      const { data, error } = await supabase
        .from('review_blocks')
        .select('*')
        .eq('issue_id', id)
        .order('sort_index');

      if (error) throw error;
      
      return (data || []).map(dbBlock => ({
        id: String(dbBlock.id),
        type: dbBlock.type as BlockType,
        content: dbBlock.payload,
        sort_index: dbBlock.sort_index,
        visible: dbBlock.visible,
        meta: dbBlock.meta as any,
        issue_id: dbBlock.issue_id,
        created_at: dbBlock.created_at,
        updated_at: dbBlock.updated_at
      })) as ReviewBlock[];
    },
    enabled: !isNewIssue && !!id && contentType === 'native'
  });

  const initialReview = useMemo(() => {
    if (isNewIssue) {
      return transformBlocksToReview([], {
        title: 'Nova Revisão',
      });
    }
    if (issue && fetchedBlocks) {
      return transformBlocksToReview(fetchedBlocks, issue);
    }
    return undefined;
  }, [issue, fetchedBlocks, isNewIssue]);

  // Update form values when issue data is loaded
  useEffect(() => {
    if (isNewIssue) {
      setFormValues({
        id: '',
        title: '',
        description: '',
        tags: '',
        pdf_url: '',
        article_pdf_url: '',
        cover_image_url: '',
        published: false,
        featured: false,
        authors: '',
        search_title: '',
        real_title: '',
        real_title_ptbr: '',
        search_description: '',
        year: '',
        design: '',
        score: 0,
        population: '',
        backend_tags: '' // Initialize backend_tags for new issues
      });
    } else if (issue) {
      const formattedTags = issue.specialty ? 
        issue.specialty.split(', ').map(tag => `[tag:${tag}]`).join('') : '';

      const issueContentType = issue.review_type === 'native' || issue.review_type === 'hybrid' 
        ? 'native' 
        : 'pdf';
      setContentType(issueContentType);

      setFormValues({
        id: issue.id,
        title: issue.title || '',
        description: issue.description || '',
        tags: formattedTags,
        pdf_url: issue.pdf_url || '',
        article_pdf_url: issue.article_pdf_url || '',
        cover_image_url: issue.cover_image_url || '',
        published: issue.published || false,
        featured: issue.featured || false,
        authors: issue.authors || '',
        search_title: issue.search_title || '',
        real_title: issue.real_title || '',
        real_title_ptbr: issue.real_title_ptbr || '',
        search_description: issue.search_description || '',
        year: issue.year || '',
        design: issue.design || '',
        score: issue.score || 0,
        population: issue.population || '',
        backend_tags: issue.backend_tags || '' // Load backend_tags from database
      });
    }
  }, [issue, isNewIssue, setFormValues]);

  // This useEffect was causing a runtime error because setNativeBlocks is not defined.
  // The state is now managed within the BlockEditor component, so this is no longer needed.
  // useEffect(() => {
  //   if (fetchedBlocks) {
  //     setNativeBlocks(fetchedBlocks);
  //   }
  // }, [fetchedBlocks]);

  const handleSaveNativeReview = async (updatedReview: Review) => {
    if (!id || isNewIssue) {
      toast({
        title: "Erro",
        description: "Salve primeiro as informações básicas antes de editar o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    const updatedBlocks = transformReviewToBlocks(updatedReview);

    try {
      // Delete existing blocks
      await supabase
        .from('review_blocks')
        .delete()
        .eq('issue_id', id);

      // Insert new blocks
      if (updatedBlocks.length > 0) {
        const blocksToInsert = updatedBlocks.map((block, index) => ({
          issue_id: id,
          sort_index: index,
          type: block.type,
          payload: block.content, // Map frontend 'content' to db 'payload'
          meta: block.meta,
          visible: block.visible,
          // The 'id' field is intentionally omitted here.
          // The database will auto-generate it since it's an identity column.
        }));

        const { error } = await supabase
          .from('review_blocks')
          .insert(blocksToInsert);

        if (error) throw error;
      }

      // Update issue to mark as native review
      await supabase
        .from('issues')
        .update({ 
          review_type: 'native',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      // Invalidate query to refetch blocks
      queryClient.invalidateQueries({ queryKey: ['review-blocks', id] });
      
      toast({
        title: "Conteúdo Salvo",
        description: "O conteúdo nativo foi salvo com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  if (!isNewIssue && isLoading) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#121212', color: '#ffffff' }}>
        Carregando...
      </div>
    );
  }

  if (!isNewIssue && error) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#121212', color: '#ffffff' }}>
        <h2 className="text-xl font-bold text-red-400 mb-2">Error loading issue</h2>
        <p className="text-gray-300">Could not load the issue data. Please try again later.</p>
        <button 
          onClick={() => navigate('/edit')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to issues list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-6 space-y-6" style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#ffffff' }}>
      <div className="flex items-center justify-between">
        <IssueHeader />
        {!isNewIssue && (
          <IssueActionButtons
            onDelete={handleDelete}
            onTogglePublish={togglePublish}
            onToggleFeatured={toggleFeatured}
            isPublished={formValues.published}
            isFeatured={formValues.featured}
            isDisabled={isSubmitting}
          />
        )}
      </div>

      <ContentTypeSelector
        contentType={contentType}
        onContentTypeChange={setContentType}
      />

      <EditorTabs
        isNewIssue={isNewIssue}
        contentType={contentType}
        issueId={id}
        formValues={formValues}
        nativeReview={initialReview} // Pass the full Review object
        onSubmit={onSubmit}
        onCancel={() => navigate('/edit')}
        isSubmitting={isSubmitting}
        onSaveNativeReview={handleSaveNativeReview} // Pass the new save handler
      />
    </div>
  );
};

export default IssueEditor;
