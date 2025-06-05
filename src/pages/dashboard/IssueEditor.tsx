
// ABOUTME: Refactored issue editor with improved layout and component separation
// Main editor page with better organization and reduced margins

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Issue } from '@/types/issue';
import { ReviewBlock } from '@/types/review';
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
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          toast({
            title: "Error loading issue",
            description: "Could not load the issue data. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
        
        return data as Issue;
      } catch (err) {
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
      
      // Transform database blocks to ReviewBlock format
      return (data || []).map(dbBlock => ({
        id: dbBlock.id,
        type: dbBlock.type as any,
        content: dbBlock.payload, // Database stores as 'payload', but we use 'content'
        sort_index: dbBlock.sort_index,
        visible: dbBlock.visible,
        meta: dbBlock.meta as any,
        issue_id: dbBlock.issue_id,
        created_at: dbBlock.created_at,
        updated_at: dbBlock.updated_at
      })) as ReviewBlock[];
    },
    enabled: !isNewIssue && !!id && contentType === 'native'
  });

  // Update form values when issue data is loaded
  useEffect(() => {
    if (isNewIssue) {
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
      const formattedTags = issue.specialty ? 
        issue.specialty.split(', ').map(tag => `[tag:${tag}]`).join('') : '';

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
        const blocksToInsert = updatedBlocks.map(block => ({
          issue_id: id,
          sort_index: block.sort_index,
          type: block.type as string,
          payload: block.content as any, // Store as 'payload' in database
          meta: block.meta as any,
          visible: block.visible
        }));

        const { error } = await supabase
          .from('review_blocks')
          .insert(blocksToInsert);

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

      // Refetch the blocks to get the proper database IDs
      const { data: newBlocks } = await supabase
        .from('review_blocks')
        .select('*')
        .eq('issue_id', id)
        .order('sort_index');

      if (newBlocks) {
        // Transform database blocks back to ReviewBlock format
        const transformedBlocks = newBlocks.map(dbBlock => ({
          id: dbBlock.id,
          type: dbBlock.type as any,
          content: dbBlock.payload, // Database stores as 'payload', but we use 'content'
          sort_index: dbBlock.sort_index,
          visible: dbBlock.visible,
          meta: dbBlock.meta as any,
          issue_id: dbBlock.issue_id,
          created_at: dbBlock.created_at,
          updated_at: dbBlock.updated_at
        })) as ReviewBlock[];
        
        setNativeBlocks(transformedBlocks);
      }
      
      toast({
        title: "Conteúdo Salvo",
        description: "O conteúdo nativo foi salvo com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  if (!isNewIssue && isLoading) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#121212', color: '#ffffff' }}>
        Carregando...
      </div>
    );
  }

  if (!isNewIssue && error) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: '#121212', color: '#ffffff' }}>
        <h2 className="text-xl font-bold text-red-400 mb-2">Error loading issue</h2>
        <p className="text-gray-300">Could not load the issue data. Please try again later.</p>
        <button 
          onClick={() => navigate('/edit')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to issues list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-6 space-y-6" style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#ffffff' }}>
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
      <Card 
        className="issue-editor-card"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a',
          color: '#ffffff'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Layers className="w-5 h-5" />
            Tipo de Conteúdo
          </CardTitle>
          <CardDescription style={{ color: '#d1d5db' }}>
            Escolha como você deseja criar e apresentar esta revisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={contentType} 
            onValueChange={(value: 'pdf' | 'native') => setContentType(value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div 
              className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-800 transition-colors"
              style={{ 
                backgroundColor: '#212121',
                borderColor: '#2a2a2a',
                color: '#ffffff'
              }}
            >
              <RadioGroupItem value="pdf" id="pdf" />
              <div className="flex-1">
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer" style={{ color: '#ffffff' }}>
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium" style={{ color: '#ffffff' }}>PDF Tradicional</div>
                    <div className="text-sm" style={{ color: '#d1d5db' }}>
                      Upload de arquivo PDF da revisão
                    </div>
                  </div>
                </Label>
              </div>
            </div>
            
            <div 
              className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-800 transition-colors"
              style={{ 
                backgroundColor: '#212121',
                borderColor: '#2a2a2a',
                color: '#ffffff'
              }}
            >
              <RadioGroupItem value="native" id="native" />
              <div className="flex-1">
                <Label htmlFor="native" className="flex items-center gap-2 cursor-pointer" style={{ color: '#ffffff' }}>
                  <Layers className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium flex items-center gap-2" style={{ color: '#ffffff' }}>
                      Revisão Nativa
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                      >
                        Novo
                      </Badge>
                    </div>
                    <div className="text-sm" style={{ color: '#d1d5db' }}>
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
        <TabsList 
          className="grid w-full grid-cols-3"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <TabsTrigger 
            value="basic"
            style={{ 
              color: '#ffffff',
              backgroundColor: 'transparent'
            }}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Informações Básicas
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            disabled={isNewIssue}
            style={{ 
              color: isNewIssue ? '#6b7280' : '#ffffff',
              backgroundColor: 'transparent'
            }}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:opacity-50"
          >
            {contentType === 'native' ? 'Editor de Conteúdo Nativo' : 'Upload PDF'}
          </TabsTrigger>
          <TabsTrigger 
            value="original"
            style={{ 
              color: '#ffffff',
              backgroundColor: 'transparent'
            }}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Artigo Original
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card 
            className="issue-editor-card"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#ffffff' }}>Informações da Revisão</CardTitle>
              <CardDescription style={{ color: '#d1d5db' }}>
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
            <Card 
              className="issue-editor-card"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a',
                color: '#ffffff'
              }}
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
                  Salve Primeiro as Informações Básicas
                </h3>
                <p className="text-center max-w-md" style={{ color: '#d1d5db' }}>
                  Complete e salve as informações básicas na aba anterior antes de adicionar conteúdo.
                </p>
              </CardContent>
            </Card>
          ) : contentType === 'native' ? (
            <Card 
              className="issue-editor-card h-[800px] flex flex-col"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a',
                color: '#ffffff'
              }}
            >
              <CardContent className="flex-1 p-0">
                <NativeEditor
                  issueId={id}
                  initialBlocks={nativeBlocks}
                  onSave={handleSaveNativeBlocks}
                  onCancel={() => {}}
                  mode="split"
                />
              </CardContent>
            </Card>
          ) : (
            <Card 
              className="issue-editor-card"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a',
                color: '#ffffff'
              }}
            >
              <CardHeader>
                <CardTitle style={{ color: '#ffffff' }}>Upload de PDF da Revisão</CardTitle>
                <CardDescription style={{ color: '#d1d5db' }}>
                  Upload do arquivo PDF da revisão para visualização tradicional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8" style={{ color: '#d1d5db' }}>
                  Componente de upload PDF será implementado aqui
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="original">
          <Card 
            className="issue-editor-card"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              color: '#ffffff'
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: '#ffffff' }}>Artigo Científico Original</CardTitle>
              <CardDescription style={{ color: '#d1d5db' }}>
                Upload do PDF do artigo original que está sendo revisado (recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8" style={{ color: '#d1d5db' }}>
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
