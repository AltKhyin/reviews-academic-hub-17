import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Upload } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Issue, FormIssueValues } from '@/types/issue';

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
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingArticlePdf, setUploadingArticlePdf] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  // Load issues from database
  const { data: issues, isLoading, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Issue[];
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
          pdf_url: values.pdf_url || 'placeholder.pdf',
          article_pdf_url: values.article_pdf_url || '', // Properly handled now
          cover_image_url: values.cover_image_url || null
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

  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'review' | 'article') => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      if (fileType === 'review') {
        setUploadingPdf(true);
      } else {
        setUploadingArticlePdf(true);
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('issues')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('issues')
        .getPublicUrl(filePath);
      
      if (fileType === 'review') {
        form.setValue('pdf_url', data.publicUrl);
      } else {
        form.setValue('article_pdf_url', data.publicUrl);
      }
      
      toast({
        title: "Arquivo enviado com sucesso",
        description: "O PDF foi carregado e associado a esta edição.",
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Erro ao enviar arquivo",
        description: "Ocorreu um erro ao carregar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      if (fileType === 'review') {
        setUploadingPdf(false);
      } else {
        setUploadingArticlePdf(false);
      }
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploadingCover(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('issues')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('issues')
        .getPublicUrl(filePath);
      
      form.setValue('cover_image_url', data.publicUrl);
      
      toast({
        title: "Imagem enviada com sucesso",
        description: "A imagem de capa foi carregada e associada a esta edição.",
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Ocorreu um erro ao carregar a imagem de capa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
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

                <FormField
                  control={form.control}
                  name="article_pdf_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artigo Original PDF</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="URL do arquivo PDF original" {...field} />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="whitespace-nowrap"
                            onClick={() => document.getElementById('article_pdf_upload')?.click()}
                            disabled={uploadingArticlePdf}
                          >
                            {uploadingArticlePdf ? 'Enviando...' : (
                              <>
                                <Upload className="h-4 w-4 mr-2" /> Upload
                              </>
                            )}
                          </Button>
                          <input
                            id="article_pdf_upload"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handlePdfUpload(e, 'article')}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        PDF do artigo original para esta edição
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pdf_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revisão PDF</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="URL do arquivo PDF da revisão" {...field} />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="whitespace-nowrap"
                            onClick={() => document.getElementById('review_pdf_upload')?.click()}
                            disabled={uploadingPdf}
                          >
                            {uploadingPdf ? 'Enviando...' : (
                              <>
                                <Upload className="h-4 w-4 mr-2" /> Upload
                              </>
                            )}
                          </Button>
                          <input
                            id="review_pdf_upload"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handlePdfUpload(e, 'review')}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        PDF da revisão desta edição
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Capa</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="URL da imagem de capa" {...field} />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="whitespace-nowrap"
                            onClick={() => document.getElementById('cover_upload')?.click()}
                            disabled={uploadingCover}
                          >
                            {uploadingCover ? 'Enviando...' : (
                              <>
                                <Upload className="h-4 w-4 mr-2" /> Upload
                              </>
                            )}
                          </Button>
                          <input
                            id="cover_upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverUpload}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        URL para a imagem de capa desta edição
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
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      {issue.pdf_url && issue.pdf_url !== 'placeholder.pdf' && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">
                          Revisão PDF
                        </span>
                      )}
                      {issue.article_pdf_url && (
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full">
                          Artigo Original
                        </span>
                      )}
                    </div>
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
