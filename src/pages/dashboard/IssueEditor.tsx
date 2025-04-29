
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueHeader } from './components/issue/IssueHeader';
import { IssueActionButtons } from './components/issue/IssueActionButtons';
import { IssueFormContainer } from './components/issue/IssueFormContainer';
import { useIssueEditor } from './hooks/useIssueEditor';
import { useQuery } from '@tanstack/react-query';
import { useIssueViews } from '@/hooks/useIssueViews';

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    formValues,
    setFormValues,
    isSubmitting, 
    setIsSubmitting,
    onSubmit,
    handleDelete,
    togglePublish,
    toggleFeatured
  } = useIssueEditor(id);

  const { getIssueViewCount } = useIssueViews();
  const [viewCount, setViewCount] = useState<number>(0);

  // Fetch issue data
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue-edit', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Issue;
    },
    enabled: !!id,
    retry: 1,
  });

  // Update form values when issue data is loaded
  useEffect(() => {
    if (issue) {
      const formattedTags = issue.specialty ? 
        issue.specialty.split(', ').map(tag => `[tag:${tag}]`).join('') : '';

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
        // New fields
        authors: issue.authors || '',
        search_title: issue.search_title || '',
        real_title: issue.real_title || '',
        real_title_ptbr: issue.real_title_ptbr || '',
        search_description: issue.search_description || '',
        year: issue.year || '',
        design: issue.design || '',
        score: issue.score || 0,
        population: issue.population || ''
      });
    }
  }, [issue, setFormValues]);

  // Get view count when issue data is loaded
  useEffect(() => {
    const loadViewCount = async () => {
      if (id) {
        const count = await getIssueViewCount(id);
        setViewCount(count);
      }
    };
    
    loadViewCount();
  }, [id, getIssueViewCount]);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <IssueHeader />
        <div className="flex items-center gap-2">
          <div className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
            {viewCount} {viewCount === 1 ? 'visualização' : 'visualizações'}
          </div>
          <IssueActionButtons
            onDelete={handleDelete}
            onTogglePublish={togglePublish}
            onToggleFeatured={toggleFeatured}
            isPublished={formValues.published}
            isFeatured={formValues.featured}
            isDisabled={isSubmitting}
          />
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Edit Issue</CardTitle>
          <CardDescription>Manage issue details</CardDescription>
        </CardHeader>
        <CardContent>
          <IssueFormContainer 
            issueId={id}
            defaultValues={formValues}
            onSubmit={onSubmit} 
            onCancel={() => navigate('/edit')} 
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueEditor;
