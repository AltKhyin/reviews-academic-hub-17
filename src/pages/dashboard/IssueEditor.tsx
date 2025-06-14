
// ABOUTME: Issue editor with proper JSON serialization for Supabase compatibility
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ReviewBlock } from '@/types/review';

// Utility to ensure JSON serialization compatibility
const serializeForSupabase = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeForSupabase);
  }
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeForSupabase(value);
    }
    return serialized;
  }
  return obj;
};

export const IssueEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [blocks, setBlocks] = useState<ReviewBlock[]>([]);

  // Fetch issue data
  const { data: issue, isLoading: issueLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) throw new Error('No issue ID provided');

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch blocks for this issue
  const { data: blocksData, isLoading: blocksLoading } = useQuery({
    queryKey: ['issue-blocks', id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('review_blocks')
        .select('*')
        .eq('issue_id', id)
        .order('sort_index');

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Update form when data loads
  useEffect(() => {
    if (issue) {
      setTitle(issue.title || '');
      setDescription(issue.description || '');
      setSpecialty(issue.specialty || '');
      setAuthors(issue.authors || '');
      setYear(issue.year || '');
    }
  }, [issue]);

  useEffect(() => {
    if (blocksData) {
      const transformedBlocks: ReviewBlock[] = blocksData.map(block => ({
        id: block.id.toString(),
        type: block.type,
        content: block.payload,
        sort_index: block.sort_index,
        visible: block.visible ?? true,
        meta: block.meta as any,
      }));
      setBlocks(transformedBlocks);
    }
  }, [blocksData]);

  // Save issue mutation
  const saveIssueMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No issue ID');

      // Update issue metadata
      const { error: issueError } = await supabase
        .from('issues')
        .update({
          title,
          description,
          specialty,
          authors,
          year,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (issueError) throw issueError;

      // Save blocks with proper serialization
      if (blocks.length > 0) {
        const blocksToInsert = blocks.map(block => ({
          issue_id: id,
          type: block.type,
          payload: serializeForSupabase(block.content),
          sort_index: block.sort_index,
          visible: block.visible,
          meta: serializeForSupabase(block.meta || {}),
        }));

        // Delete existing blocks first
        const { error: deleteError } = await supabase
          .from('review_blocks')
          .delete()
          .eq('issue_id', id);

        if (deleteError) throw deleteError;

        // Insert new blocks
        const { error: insertError } = await supabase
          .from('review_blocks')
          .insert(blocksToInsert);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      toast.success('Edição salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issue-blocks', id] });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Erro ao salvar edição. Tente novamente.');
    },
  });

  const handleSave = () => {
    saveIssueMutation.mutate();
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  if (issueLoading || blocksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={handleGoBack} variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saveIssueMutation.isPending}
          className="flex items-center gap-2"
        >
          {saveIssueMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Edição
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Edição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da edição"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição da edição"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="ex: Cardiologia"
              />
            </div>
            
            <div>
              <Label htmlFor="authors">Autores</Label>
              <Input
                id="authors"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Nome dos autores"
              />
            </div>
            
            <div>
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks preview */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blocos de Conteúdo ({blocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blocks.map((block, index) => (
                <div key={block.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {index + 1}. {block.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {block.visible ? 'Visível' : 'Oculto'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
