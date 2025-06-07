
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { useIssueUpdate } from './useIssueUpdate';
import { useCreateDiscussionPost } from '@/hooks/useIssueDiscussion';

export const useIssueEditor = (id?: string) => {
  const [formValues, setFormValues] = useState<IssueFormValues>({
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
    backend_tags: '' // Include backend_tags in initial state
  });

  const { isSubmitting, setIsSubmitting, updateIssue, deleteIssue } = useIssueUpdate(id);
  const createDiscussionPost = useCreateDiscussionPost();

  const onSubmit = async (values: IssueFormValues) => {
    await updateIssue(values, formValues);
    setFormValues(values);
  };

  const handleDelete = async () => {
    await deleteIssue();
  };

  const togglePublish = async () => {
    try {
      setIsSubmitting(true);
      
      const updatedValues = {
        ...formValues,
        published: !formValues.published
      };
      
      await updateIssue(updatedValues, formValues);
      setFormValues(updatedValues);
      
      // If publishing for the first time, create discussion post
      if (updatedValues.published && !formValues.published && id) {
        try {
          const discussionSettings = (window as any).issueDiscussionSettings || {
            discussionContent: '',
            includeReadButton: true,
            pinDurationDays: 7
          };

          await createDiscussionPost.mutateAsync({
            issueId: id,
            issueTitle: formValues.title,
            discussionContent: discussionSettings.discussionContent,
            includeReadButton: discussionSettings.includeReadButton,
            pinDurationDays: discussionSettings.pinDurationDays
          });
        } catch (discussionError) {
          console.error('Failed to create discussion post:', discussionError);
          toast({
            title: "Aviso",
            description: "Edição publicada, mas discussão automática não foi criada. Você pode criar manualmente.",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: updatedValues.published ? "Issue published!" : "Issue unpublished",
        description: updatedValues.published 
          ? "The issue is now visible to readers."
          : "The issue has been set back to draft mode.",
      });
    } catch (error: any) {
      console.error('Error toggling published status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeatured = async () => {
    try {
      setIsSubmitting(true);
      
      const updatedValues = {
        ...formValues,
        featured: !formValues.featured
      };
      
      await updateIssue(updatedValues, formValues);
      setFormValues(updatedValues);
      
      toast({
        title: updatedValues.featured ? "Edição destacada!" : "Edição removida dos destaques",
        description: updatedValues.featured 
          ? "Esta edição será exibida em destaque na página inicial."
          : "Esta edição não será mais exibida em destaque.",
      });
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Erro ao alterar destaque",
        description: error.message || "Ocorreu um erro ao alterar o destaque da edição.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    setFormValues,
    isSubmitting,
    setIsSubmitting,
    onSubmit,
    handleDelete,
    togglePublish,
    toggleFeatured
  };
};
