
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Issue, FormIssueValues } from '@/types/issue';
import { IssueForm } from './components/IssueForm';
import { IssueCard } from './components/IssueCard';

// Form schema for issue creation/editing
const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tags: z.string().optional(),
  pdf_url: z.string().optional(),
  article_pdf_url: z.string().optional(),
  cover_image_url: z.string().optional()
});

const Edit = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load issues from database
  const { data: issues, isLoading, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Issue[];
      } catch (error) {
        console.error('Error fetching issues:', error);
        toast({
          title: "Erro ao carregar edições",
          description: "Não foi possível carregar a lista de edições.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Setup form with react-hook-form
  const form = useForm<FormIssueValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      pdf_url: '',
      article_pdf_url: '',
      cover_image_url: ''
    }
  });

  const onSubmit = async (values: FormIssueValues) => {
    try {
      setIsSubmitting(true);
      console.log('Form values:', values);
      
      // Extract tags from the format [tag:name][tag:name2]
      const tagMatches = values.tags ? [...values.tags.matchAll(/\[tag:([^\]]+)\]/g)] : [];
      const extractedTags = tagMatches.map(match => match[1]);
      
      // Prepare data for insert
      const issueData = {
        title: values.title,
        description: values.description || '',
        specialty: extractedTags.join(', '), // Store as comma-separated for now
        pdf_url: values.pdf_url || 'placeholder.pdf',
        article_pdf_url: values.article_pdf_url || '',
        cover_image_url: values.cover_image_url || null
      };
      
      console.log('Issue data to insert:', issueData);
      
      // Insert the issue
      const { data, error } = await supabase
        .from('issues')
        .insert(issueData)
        .select();
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      toast({
        title: "Edição criada com sucesso!",
        description: "A nova edição foi adicionada ao sistema.",
      });
      
      // Reset form and return to list view
      form.reset();
      setIsCreating(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast({
        title: "Erro ao criar edição",
        description: error.message || "Ocorreu um erro ao salvar a edição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    form.reset();
    setIsCreating(false);
  };

  // Helper function to format tags for display
  const formatTags = (specialtyString: string) => {
    if (!specialtyString) return '';
    return specialtyString.split(', ')
      .map(tag => `[tag:${tag}]`)
      .join('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Painel do Editor</h1>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Edição
          </Button>
        )}
      </div>

      {isCreating ? (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Nova Edição</CardTitle>
            <CardDescription>Crie uma nova edição para a revista</CardDescription>
          </CardHeader>
          <CardContent>
            <IssueForm 
              form={form}
              onSubmit={onSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p>Carregando edições...</p>
          ) : issues && issues.length > 0 ? (
            issues.map((issue) => (
              <IssueCard 
                key={issue.id}
                issue={issue} 
                formatTags={formatTags}
              />
            ))
          ) : (
            <p>Nenhuma edição encontrada.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Edit;
