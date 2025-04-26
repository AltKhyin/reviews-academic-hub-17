
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

// Form schema for issue creation/editing
const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tags: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const Edit = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  
  // Load issues from database
  const { data: issues, isLoading, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Setup form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Extract tags from the format [tag:name][tag:name2]
      const tagMatches = values.tags ? [...values.tags.matchAll(/\[tag:([^\]]+)\]/g)] : [];
      const extractedTags = tagMatches.map(match => match[1]);
      
      // Insert the issue
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: values.title,
          description: values.description || '',
          specialty: extractedTags.join(', '), // Store as comma-separated for now
          pdf_url: 'placeholder.pdf', // This would be replaced with actual file upload
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Edição criada com sucesso!",
        description: "A nova edição foi adicionada ao sistema.",
      });
      
      // Reset form and return to list view
      form.reset();
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast({
        title: "Erro ao criar edição",
        description: "Ocorreu um erro ao salvar a edição. Tente novamente.",
        variant: "destructive",
      });
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título da edição" {...field} />
                      </FormControl>
                      <FormDescription>
                        O título principal desta edição
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição curta sobre o conteúdo desta edição" 
                          {...field}
                          rows={4} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="[tag:hematologia][tag:medicina]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Use o formato [tag:nome] para cada tag
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" type="button" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p>Carregando edições...</p>
          ) : (
            issues?.map((issue) => (
              <Card key={issue.id} className="hover:bg-accent/5 transition-colors border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg">{issue.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {issue.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </CardTitle>
                  <CardDescription>{issue.description || 'Sem descrição'}</CardDescription>
                  {issue.specialty && (
                    <div className="mt-2 text-xs">
                      <p className="text-muted-foreground">Tags: {formatTags(issue.specialty)}</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/edit/issue/${issue.id}`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Edit;
