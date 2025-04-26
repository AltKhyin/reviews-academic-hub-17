
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, Save, Trash } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Issue, FormIssueValues } from '@/types/issue';
import { IssueForm } from './components/IssueForm';

// Form schema for issue editing
const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tags: z.string().optional(),
  pdf_url: z.string().optional(),
  article_pdf_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().default(false)
});

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Setup form with react-hook-form
  const form = useForm<FormIssueValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      pdf_url: '',
      article_pdf_url: '',
      cover_image_url: '',
      published: false
    }
  });

  // Fetch issue data on component mount
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
          // Format specialty tags before setting in form
          const formattedTags = typedIssue.specialty ? 
            typedIssue.specialty.split(', ').map(tag => `[tag:${tag}]`).join('') : '';

          form.reset({
            title: typedIssue.title || '',
            description: typedIssue.description || '',
            tags: formattedTags,
            pdf_url: typedIssue.pdf_url || '',
            article_pdf_url: typedIssue.article_pdf_url || '',
            cover_image_url: typedIssue.cover_image_url || '',
            published: typedIssue.published || false
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

  const onSubmit = async (values: FormIssueValues) => {
    if (!id) return;

    try {
      // Extract tags from the format [tag:name][tag:name2]
      const tagMatches = values.tags ? [...values.tags.matchAll(/\[tag:([^\]]+)\]/g)] : [];
      const extractedTags = tagMatches.map(match => match[1]);
      
      // Update the issue
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
          updated_at: new Date().toISOString(),
          ...(values.published && { published_at: new Date().toISOString() })
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Edição atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    } catch (error) {
      console.error('Error updating issue:', error);
      toast({
        title: "Erro ao atualizar edição",
        description: "Ocorreu um erro ao salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Tem certeza que deseja excluir esta edição?')) return;

    try {
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
    }
  };

  const togglePublish = async () => {
    const currentStatus = form.getValues('published');
    form.setValue('published', !currentStatus);
    await form.handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/edit')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleDelete} className="text-red-500 hover:text-red-700">
            <Trash className="mr-2 h-4 w-4" /> Excluir
          </Button>
          <Button 
            variant={form.watch('published') ? "outline" : "default"}
            onClick={togglePublish}
          >
            {form.watch('published') ? 'Despublicar' : 'Publicar'}
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Editar Edição</CardTitle>
          <CardDescription>Gerencie os detalhes desta edição</CardDescription>
        </CardHeader>
        <CardContent>
          <IssueForm 
            form={form} 
            onSubmit={onSubmit} 
            onCancel={() => navigate('/edit')} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueEditor;
