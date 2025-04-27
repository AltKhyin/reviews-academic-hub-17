
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { IssueFormValues, issueFormSchema } from '@/schemas/issue-form-schema';
import { IssueHeader } from './components/issue/IssueHeader';
import { IssueActionButtons } from './components/issue/IssueActionButtons';
import { IssueForm } from './components/issue/IssueForm';
import { useQuery } from '@tanstack/react-query';

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
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
    featured: false
  });

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
        title: issue.title || '',
        description: issue.description || '',
        tags: formattedTags,
        pdf_url: issue.pdf_url || '',
        article_pdf_url: issue.article_pdf_url || '',
        cover_image_url: issue.cover_image_url || '',
        published: issue.published || false,
        featured: issue.featured || false
      });
    }
  }, [issue]);

  const onSubmit = async (values: IssueFormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      const tagMatches = values.tags ? [...values.tags.matchAll(/\[tag:([^\]]+)\]/g)] : [];
      const extractedTags = tagMatches.map(match => match[1]);
      
      const { error } = await supabase
        .from('issues')
        .update({
          title: values.title,
          description: values.description || '',
          specialty: extractedTags.join(', '),
          pdf_url: values.pdf_url || 'placeholder.pdf',
          article_pdf_url: values.article_pdf_url || '',
          cover_image_url: values.cover_image_url,
          published: values.published,
          featured: values.featured,
          updated_at: new Date().toISOString(),
          ...(values.published && { published_at: new Date().toISOString() })
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Issue updated successfully!",
        description: "Changes have been saved.",
      });
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
    setFormValues(prev => ({
      ...prev,
      published: !prev.published
    }));
    
    // Make a new copy of the values to submit
    const updatedValues = {
      ...formValues,
      published: !formValues.published
    };
    
    await onSubmit(updatedValues);
  };

  const toggleFeatured = async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      // Update the form values
      setFormValues(prev => ({
        ...prev,
        featured: !prev.featured
      }));
      
      // Make a new copy of the values to submit
      const updatedValues = {
        ...formValues,
        featured: !formValues.featured
      };
      
      // Submit with updated value
      await onSubmit(updatedValues);
      
      toast({
        title: !formValues.featured ? "Edição destacada!" : "Edição removida dos destaques",
        description: !formValues.featured 
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

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

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
          <IssueForm 
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
