// ABOUTME: Native review editor with block-based content creation
// Provides drag-and-drop interface and real-time preview

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Eye, Code, Save, Settings, Moon } from 'lucide-react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockPalette } from './BlockPalette';
import { BlockEditor } from './BlockEditor';
import { ReviewPreview } from './ReviewPreview';
import { cn } from '@/lib/utils';

interface NativeEditorProps {
  issueId?: string;
  initialBlocks?: ReviewBlock[];
  onSave: (blocks: ReviewBlock[]) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const NativeEditor: React.FC<NativeEditorProps> = ({
  issueId,
  initialBlocks = [],
  onSave,
  onCancel,
  className
}) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isSaving, setIsSaving] = useState(false);

  const addBlock = useCallback((type: BlockType, position?: number) => {
    // Generate a temporary negative ID for new blocks (will be replaced by database)
    const tempId = -(Date.now() + Math.random());
    
    const newBlock: ReviewBlock = {
      id: tempId,
      issue_id: issueId || '',
      sort_index: position ?? blocks.length,
      type,
      payload: getDefaultPayload(type),
      meta: {
        styles: {},
        conditions: {},
        analytics: {
          track_views: true,
          track_interactions: true
        }
      },
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedBlocks = [...blocks];
    if (position !== undefined) {
      updatedBlocks.splice(position, 0, newBlock);
      // Update sort indices for blocks after insertion point
      updatedBlocks.forEach((block, index) => {
        block.sort_index = index;
      });
    } else {
      updatedBlocks.push(newBlock);
    }

    setBlocks(updatedBlocks);
    setActiveBlockId(newBlock.id);
  }, [blocks, issueId]);

  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, ...updates, updated_at: new Date().toISOString() }
        : block
    ));
  }, []);

  const deleteBlock = useCallback((blockId: number) => {
    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== blockId);
      // Update sort indices
      return filtered.map((block, index) => ({
        ...block,
        sort_index: index
      }));
    });
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [activeBlockId]);

  const moveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const currentIndex = prev.findIndex(block => block.id === blockId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newBlocks = [...prev];
      [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
      
      // Update sort indices
      return newBlocks.map((block, index) => ({
        ...block,
        sort_index: index
      }));
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(blocks);
    } finally {
      setIsSaving(false);
    }
  };

  const getDefaultPayload = (type: BlockType): Record<string, any> => {
    switch (type) {
      case 'snapshot_card':
        return {
          population: '',
          intervention: '',
          comparison: '',
          outcome: '',
          design: '',
          key_findings: [],
          evidence_level: 'moderate',
          recommendation_strength: 'conditional'
        };
      case 'heading':
        return {
          text: 'Nova Seção',
          level: 2,
          slug: '',
          anchor_id: ''
        };
      case 'paragraph':
        return {
          content: '<p>Digite o conteúdo aqui...</p>',
          citations: []
        };
      case 'figure':
        return {
          image_url: '',
          caption: '',
          alt_text: '',
          figure_number: null
        };
      case 'table':
        return {
          headers: ['Coluna 1', 'Coluna 2'],
          rows: [['Dado 1', 'Dado 2']],
          caption: '',
          sortable: true
        };
      case 'callout':
        return {
          type: 'info',
          title: '',
          content: 'Conteúdo do destaque...',
          icon: ''
        };
      case 'number_card':
        return {
          number: '0',
          label: 'Métrica',
          description: '',
          trend: 'neutral'
        };
      case 'reviewer_quote':
        return {
          quote: '',
          author: '',
          title: '',
          institution: '',
          avatar_url: ''
        };
      case 'poll':
        return {
          question: 'Nova pergunta de enquete',
          options: [
            { id: '1', text: 'Opção 1', votes: 0 },
            { id: '2', text: 'Opção 2', votes: 0 }
          ],
          poll_type: 'single_choice',
          total_votes: 0,
          is_open: true
        };
      case 'citation_list':
        return {
          title: 'Referências Bibliográficas',
          citations: [],
          style: 'apa',
          show_numbers: true,
          show_links: true
        };
      default:
        return {};
    }
  };

  return (
    <div className={cn("native-editor editor-layout bg-gray-900", className)}>
      {/* Editor Header */}
      <div className="editor-header bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Editor de Revisão Nativa</h2>
            </div>
            <Badge variant="outline" className="bg-gray-800 text-gray-200 border-gray-600">
              {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex border rounded-lg overflow-hidden border-gray-600 bg-gray-800">
              <Button
                variant={editorMode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditorMode('edit')}
                className="rounded-none border-0 text-gray-200 bg-gray-800 hover:bg-gray-700"
              >
                <Code className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant={editorMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditorMode('preview')}
                className="rounded-none border-0 text-gray-200 bg-gray-800 hover:bg-gray-700"
              >
                <Eye className="w-4 h-4 mr-1" />
                Visualizar
              </Button>
              <Button
                variant={editorMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditorMode('split')}
                className="rounded-none border-0 text-gray-200 bg-gray-800 hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-1" />
                Dividido
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6 border-gray-600" />
            
            {/* Action Buttons */}
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="border-gray-600 text-gray-200 hover:bg-gray-800 bg-gray-900"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-content bg-gray-900">
        {/* Block Palette - Left Sidebar */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className="w-80 editor-sidebar overflow-y-auto bg-gray-900 border-r border-gray-700">
            <BlockPalette onAddBlock={addBlock} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="editor-main bg-gray-900">
          {editorMode === 'edit' && (
            <BlockEditor
              blocks={blocks}
              activeBlockId={activeBlockId}
              onActiveBlockChange={setActiveBlockId}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onMoveBlock={moveBlock}
              onAddBlock={addBlock}
            />
          )}

          {editorMode === 'preview' && (
            <ReviewPreview
              blocks={blocks}
              className="p-6 bg-gray-900"
            />
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-2 h-full">
              <div className="border-r border-gray-700 bg-gray-900">
                <BlockEditor
                  blocks={blocks}
                  activeBlockId={activeBlockId}
                  onActiveBlockChange={setActiveBlockId}
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock}
                  onMoveBlock={moveBlock}
                  onAddBlock={addBlock}
                  compact
                />
              </div>
              <div className="overflow-y-auto bg-gray-900">
                <ReviewPreview
                  blocks={blocks}
                  className="p-6"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
