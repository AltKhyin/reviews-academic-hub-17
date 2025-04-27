
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { IssueForm } from './components/IssueForm';
import { issueFormSchema, IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueHeader } from './components/issue/IssueHeader';
import { IssueActionButtons } from './components/issue/IssueActionButtons';

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      pdf_url: '',
      article_pdf_url: '',
      cover_image_url: '',
      published: false,
      featured: false
    }
  });

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const typedIssue = data as Issue;
          const formattedTags = typedIssue.specialty ? 
            typedIssue.specialty.split(', ').map(tag => `[tag:${tag}]`).join('') : '';

          form.reset({
            title: typedIssue.title || '',
            description: typedIssue.description || '',
            tags: formattedTags,
            pdf_url: typedIssue.pdf_url || '',
            article_pdf_url: typedIssue.article_pdf_url || '',
            cover_image_url: typedIssue.cover_image_url || '',
            published: typedIssue.published || false,
            featured: typedIssue.featured || false
          });
        }
      } catch (error) {
        console.error('Error fetching issue:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados desta edição.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [id, form]);

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
    } catch (error) {
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
    const currentStatus = form.getValues('published');
    form.setValue('published', !currentStatus);
    await form.handleSubmit(onSubmit)();
  };

  const toggleFeatured = async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      // Get the current featured value
      const currentFeatured = form.getValues('featured');
      
      // Update the form value
      form.setValue('featured', !currentFeatured);
      
      // Submit the form
      await form.handleSubmit(onSubmit)();
      
      toast({
        title: !currentFeatured ? "Edição destacada!" : "Edição removida dos destaques",
        description: !currentFeatured 
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
          isPublished={form.watch('published')}
          isFeatured={form.watch('featured')}
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
            form={form} 
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
