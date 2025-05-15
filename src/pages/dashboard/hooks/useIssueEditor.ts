
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { IssueFormValues } from '@/schemas/issue-form-schema';

export const useIssueEditor = (id?: string) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    population: ''
  });

  const onSubmit = async (values: IssueFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      const tagMatches = values.tags ? [...values.tags.matchAll(/\[tag:([^\]]+)\]/g)] : [];
      const extractedTags = tagMatches.map(match => match[1]);
      
      console.log('Submitting with values:', values);
      console.log('Extracted tags:', extractedTags);
      
      // Create an update object with only the properties that are present
      const updateObj: any = {
        title: values.title,
        specialty: extractedTags.join(', '),
        updated_at: new Date().toISOString(),
      };

      // Only include properties if they have a value
      if (values.description !== undefined) updateObj.description = values.description;
      if (values.pdf_url) updateObj.pdf_url = values.pdf_url;
      else if (formValues.pdf_url) updateObj.pdf_url = formValues.pdf_url; // Keep the existing value
      
      if (values.article_pdf_url !== undefined) updateObj.article_pdf_url = values.article_pdf_url;
      if (values.cover_image_url !== undefined) updateObj.cover_image_url = values.cover_image_url;
      if (values.published !== undefined) updateObj.published = values.published;
      if (values.featured !== undefined) updateObj.featured = values.featured;
      
      // Additional fields - only add if they exist
      if (values.authors !== undefined) updateObj.authors = values.authors;
      if (values.search_title !== undefined) updateObj.search_title = values.search_title;
      if (values.real_title !== undefined) updateObj.real_title = values.real_title;
      if (values.real_title_ptbr !== undefined) updateObj.real_title_ptbr = values.real_title_ptbr;
      if (values.search_description !== undefined) updateObj.search_description = values.search_description;
      if (values.year !== undefined) updateObj.year = values.year;
      if (values.design !== undefined) updateObj.design = values.design;
      if (values.score !== undefined) updateObj.score = values.score;
      if (values.population !== undefined) updateObj.population = values.population;
      
      // If an issue is being published for the first time, set published_at
      if (values.published && !formValues.published) {
        updateObj.published_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('issues')
        .update(updateObj)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Issue updated successfully!",
        description: "Changes have been saved.",
      });
      
      // Update the form values
      setFormValues(values);
    } catch (error: any) {
      console.error('Error updating issue:', error);
      toast({
        title: "Error updating issue",
        description: error.message || "An error occurred while saving changes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Tem certeza que deseja excluir esta edição?')) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Edição excluída",
        description: "A edição foi removida com sucesso.",
      });
      
      navigate('/edit');
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      toast({
        title: "Erro ao excluir edição",
        description: "Ocorreu um erro ao tentar excluir a edição.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePublish = async () => {
    try {
      setIsSubmitting(true);
      
      // Update the form values with the new published state
      const updatedValues = {
        ...formValues,
        published: !formValues.published
      };
      
      await onSubmit(updatedValues);
      
      // Update local state after successful submission
      setFormValues(updatedValues);
      
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
      
      // Update the form values with the new featured state
      const updatedValues = {
        ...formValues,
        featured: !formValues.featured
      };
      
      await onSubmit(updatedValues);
      
      // Update local state after successful submission
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
