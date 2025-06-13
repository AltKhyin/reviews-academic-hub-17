
// ABOUTME: Migrated issue editor using coordinated data access patterns
// Replaces individual API calls with standardized data hooks - PHASE B MIGRATION

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { ReviewBlock } from '@/types/review';
import { IssueHeader } from './components/issue/IssueHeader';
import { IssueActionButtons } from './components/issue/IssueActionButtons';
import { ContentTypeSelector } from './components/editor/ContentTypeSelector';
import { EditorTabs } from './components/editor/EditorTabs';
import { useIssueEditor } from './hooks/useIssueEditor';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { architecturalGuards } from '@/core/ArchitecturalGuards';

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewIssue = id === 'new';
  
  const [contentType, setContentType] = useState<'pdf' | 'native'>('pdf');
  const [nativeBlocks, setNativeBlocks] = useState<ReviewBlock[]>([]);
  
  // ARCHITECTURAL FIX: Use coordinated data access instead of individual queries
  const { data: pageData, loading: dataLoading, error: dataError } = useStandardizedData.usePageData(`/edit/${id}`);
  
  const { 
    formValues,
    setFormValues,
    isSubmitting, 
    onSubmit,
    handleDelete,
    togglePublish,
    toggleFeatured
  } = useIssueEditor(isNewIssue ? undefined : id);

  // PERFORMANCE MONITORING: Track coordination usage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const violations = architecturalGuards.flagArchitecturalViolations();
      const editorViolations = violations.filter(v => v.component.includes('IssueEditor'));
      
      if (editorViolations.length > 0) {
        console.warn('🚨 IssueEditor: Architectural violations detected:', editorViolations);
      } else {
        console.log('✅ IssueEditor: Using coordinated data access successfully');
      }
    }
  }, []);

  // Extract issue and blocks from coordinated page data
  const issue = pageData?.contentData?.currentIssue;
  const blocks = pageData?.contentData?.blocks || [];

  // Update form values when issue data is loaded through coordination
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
        backend_tags: ''
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
        backend_tags: issue.backend_tags || ''
      });
    }
  }, [issue, isNewIssue, setFormValues]);

  // Update native blocks when coordinated data is loaded
  useEffect(() => {
    if (blocks && blocks.length > 0) {
      const transformedBlocks = blocks.map(dbBlock => ({
        id: dbBlock.id,
        type: dbBlock.type as any,
        content: dbBlock.payload || dbBlock.content,
        sort_index: dbBlock.sort_index,
        visible: dbBlock.visible,
        meta: dbBlock.meta as any,
        issue_id: dbBlock.issue_id,
        created_at: dbBlock.created_at,
        updated_at: dbBlock.updated_at
      })) as ReviewBlock[];
      
      setNativeBlocks(transformedBlocks);
    }
  }, [blocks]);

  const handleSaveNativeBlocks = async (updatedBlocks: ReviewBlock[]) => {
    if (!id || isNewIssue) {
      toast({
        title: "Erro",
        description: "Salve primeiro as informações básicas antes de editar o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use coordinated save through standardized data system
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Delete existing blocks
      await supabase
        .from('review_blocks')
        .delete()
        .eq('issue_id', id);

      // Insert new blocks
      if (updatedBlocks.length > 0) {
        const blocksToInsert = updatedBlocks.map(block => ({
          issue_id: id,
          sort_index: block.sort_index,
          type: block.type as string,
          payload: block.content as any,
          meta: block.meta as any,
          visible: block.visible
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

      // Invalidate coordinated cache to refresh data
      const { requestCoordinator } = await import('@/core/RequestCoordinator');
      requestCoordinator.invalidateCache();

      toast({
        title: "Conteúdo Salvo",
        description: "O conteúdo nativo foi salvo com sucesso.",
      });
    } catch (error: any) {
      console.error('IssueEditor: Save error via coordinated system:', error);
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  if (!isNewIssue && dataLoading) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#121212', color: '#ffffff' }}>
        Carregando via sistema coordenado...
      </div>
    );
  }

  if (!isNewIssue && dataError) {
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
        nativeBlocks={nativeBlocks}
        onSubmit={onSubmit}
        onCancel={() => navigate('/edit')}
        isSubmitting={isSubmitting}
        onSaveNativeBlocks={handleSaveNativeBlocks}
      />
    </div>
  );
};

export default IssueEditor;
