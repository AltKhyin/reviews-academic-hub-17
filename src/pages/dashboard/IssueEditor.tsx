
// ABOUTME: Enhanced issue editor with native review support
// Supports both traditional PDF and native block-based content creation

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { ReviewBlock } from '@/types/review';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueHeader } from './components/issue/IssueHeader';
import { IssueActionButtons } from './components/issue/IssueActionButtons';
import { IssueFormContainer } from './components/issue/IssueFormContainer';
import { NativeEditor } from '@/components/editor/NativeEditor';
import { useIssueEditor } from './hooks/useIssueEditor';
import { useQuery } from '@tanstack/react-query';
import { FileText, Layers, Upload } from 'lucide-react';

const IssueEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewIssue = id === 'new';
  
  const [contentType, setContentType] = useState<'pdf' | 'native'>('pdf');
  const [nativeBlocks, setNativeBlocks] = useState<ReviewBlock[]>([]);
  
  const { 
    formValues,
    setFormValues,
    isSubmitting, 
    setIsSubmitting,
    onSubmit,
    handleDelete,
    togglePublish,
    toggleFeatured
  } = useIssueEditor(isNewIssue ? undefined : id);

  // Fetch issue data only if editing existing issue
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue-edit', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;

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
    enabled: !isNewIssue && !!id,
    retry: 1,
  });

  // Fetch native blocks if this is a native review
  const { data: blocks } = useQuery({
    queryKey: ['review-blocks', id],
    queryFn: async () => {
      if (!id || isNewIssue) return [];
      
      const { data, error } = await supabase
        .from('review_blocks')
        .select('*')
        .eq('issue_id', id)
        .order('sort_index');

      if (error) throw error;
      return data as ReviewBlock[];
    },
    enabled: !isNewIssue && !!id && contentType === 'native'
  });

  // Update form values when issue data is loaded
  useEffect(() => {
    if (isNewIssue) {
      console.log('Setting default values for new issue');
      setFormValues({
        id: '',
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
    } else if (issue) {
      console.log('Setting form values with:', issue);
      const formattedTags = issue.specialty ? 
        issue.specialty.split(', ').map(tag => `[tag:${tag}]`).join('') : '';

      // Determine content type based on issue data
      const issueContentType = issue.review_type === 'native' || issue.review_type === 'hybrid' 
        ? 'native' 
        : 'pdf';
      setContentType(issueContentType);

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
  }, [issue, isNewIssue, setFormValues]);

  // Update native blocks when data is loaded
  useEffect(() => {
    if (blocks) {
      setNativeBlocks(blocks);
    }
  }, [blocks]);

  const handleSaveNativeBlocks = async (updatedBlocks: ReviewBlock[]) => {
    if (!id || isNewIssue) {
      toast({
        title: "Erro",
        description: "Salve primeiro as informações básicas antes de editar o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete existing blocks
      await supabase
        .from('review_blocks')
        .delete()
        .eq('issue_id', id);

      // Insert new blocks
      if (updatedBlocks.length > 0) {
        const { error } = await supabase
          .from('review_blocks')
          .insert(updatedBlocks.map(block => ({
            ...block,
            issue_id: id
          })));

        if (error) throw error;
      }

      // Update issue to mark as native review
      await supabase
        .from('issues')
        .update({ 
          review_type: 'native',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      setNativeBlocks(updatedBlocks);
      
      toast({
        title: "Conteúdo Salvo",
        description: "O conteúdo nativo foi salvo com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving native blocks:', error);
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  if (!isNewIssue && isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!isNewIssue && error) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <IssueHeader />
        {!isNewIssue && (
          <IssueActionButtons
            onDelete={handleDelete}
            onTogglePublish={togglePublish}
            onToggleFeatured={toggleFeatured}
            isPublished={formValues.published}
            isFeatured={formValues.featured}
            isDisabled={isSubmitting}
          />
        )}
      </div>

      {/* Content Type Selection */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Tipo de Conteúdo
          </CardTitle>
          <CardDescription>
            Escolha como você deseja criar e apresentar esta revisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={contentType} 
            onValueChange={(value: 'pdf' | 'native') => setContentType(value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="pdf" id="pdf" />
              <div className="flex-1">
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">PDF Tradicional</div>
                    <div className="text-sm text-gray-500">
                      Upload de arquivo PDF da revisão
                    </div>
                  </div>
                </Label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="native" id="native" />
              <div className="flex-1">
                <Label htmlFor="native" className="flex items-center gap-2 cursor-pointer">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Revisão Nativa
                      <Badge variant="secondary" className="text-xs">Novo</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Editor de blocos interativo
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="content" disabled={isNewIssue}>
            {contentType === 'native' ? 'Editor Nativo' : 'Upload PDF'}
          </TabsTrigger>
          <TabsTrigger value="original">Artigo Original</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Informações da Revisão</CardTitle>
              <CardDescription>
                Metadados e informações básicas da revisão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IssueFormContainer 
                issueId={isNewIssue ? undefined : id}
                defaultValues={formValues}
                onSubmit={onSubmit} 
                onCancel={() => navigate('/edit')} 
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          {isNewIssue ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Salve Primeiro as Informações Básicas
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Complete e salve as informações básicas na aba anterior antes de adicionar conteúdo.
                </p>
              </CardContent>
            </Card>
          ) : contentType === 'native' ? (
            <Card className="border-white/10 bg-white/5 h-[800px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Editor de Conteúdo Nativo
                </CardTitle>
                <CardDescription>
                  Crie conteúdo interativo usando blocos
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <NativeEditor
                  issueId={id}
                  initialBlocks={nativeBlocks}
                  onSave={handleSaveNativeBlocks}
                  onCancel={() => {}}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle>Upload de PDF da Revisão</CardTitle>
                <CardDescription>
                  Upload do arquivo PDF da revisão para visualização tradicional
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Traditional PDF upload form would go here */}
                <div className="text-center py-8 text-gray-500">
                  Componente de upload PDF será implementado aqui
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="original">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Artigo Científico Original</CardTitle>
              <CardDescription>
                Upload do PDF do artigo original que está sendo revisado (recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Componente de upload do artigo original será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IssueEditor;
