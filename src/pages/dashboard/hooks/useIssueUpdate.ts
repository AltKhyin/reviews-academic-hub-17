
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { IssueFormValues } from '@/schemas/issue-form-schema';

export const useIssueUpdate = (id?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateIssue = async (values: IssueFormValues, currentValues: IssueFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      // Convert tags from [tag:name] format to comma-separated string
      const specialtyTags = values.tags
        .match(/\[tag:([^\]]+)\]/g)
        ?.map(tag => tag.replace(/\[tag:([^\]]+)\]/, '$1'))
        .join(', ') || '';

      const updateData = {
        title: values.title,
        description: values.description,
        specialty: specialtyTags,
        pdf_url: values.pdf_url,
        article_pdf_url: values.article_pdf_url,
        cover_image_url: values.cover_image_url,
        published: values.published,
        featured: values.featured,
        authors: values.authors,
        search_title: values.search_title,
        real_title: values.real_title,
        real_title_ptbr: values.real_title_ptbr,
        search_description: values.search_description,
        year: values.year,
        design: values.design,
        score: values.score,
        population: values.population,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Issue updated successfully!",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error('Error updating issue:', error);
      toast({
        title: "Error updating issue",
        description: error.message || "Could not update the issue. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteIssue = async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Issue deleted successfully!",
        description: "The issue has been removed.",
      });

      navigate('/edit');
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      toast({
        title: "Error deleting issue",
        description: error.message || "Could not delete the issue. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    updateIssue,
    deleteIssue
  };
};
