
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

  // Fetch issue data
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue-edit', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        console.log('Fetching issue with id:', id);
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching issue:', error);
          toast({
            title: "Error loading issue",
            description: "Could not load the issue data. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
        
        console.log('Fetched issue data:', data);
        return data as Issue;
      } catch (err) {
        console.error('Exception in fetchIssue:', err);
        throw err;
      }
    },
    enabled: !!id,
    retry: 1,
  });

  // Update form values when issue data is loaded
  useEffect(() => {
    if (issue) {
      console.log('Setting form values with:', issue);
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
        // Additional fields
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

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Error loading issue</h2>
        <p>Could not load the issue data. Please try again later.</p>
        <button 
          onClick={() => navigate('/edit')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Back to issues list
        </button>
      </div>
    );
  }

  // Even if we don't have issue data yet, we can still render the form
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <IssueHeader />
        <IssueActionButtons
          onDelete={handleDelete}
          onTogglePublish={togglePublish}
          onToggleFeatured={toggleFeatured}
          isPublished={formValues.published}
          isFeatured={formValues.featured}
          isDisabled={isSubmitting}
        />
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
