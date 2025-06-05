
// ABOUTME: Native review editor with block-based content creation
// Provides drag-and-drop interface and real-time preview

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Eye, Code, Save, Settings } from 'lucide-react';
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
      default:
        return {};
    }
  };

  return (
    <div className={cn("native-editor h-full", className)}>
      {/* Editor Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Editor de Revisão Nativa</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={editorMode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditorMode('edit')}
                className="rounded-none border-0"
              >
                <Code className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant={editorMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditorMode('preview')}
                className="rounded-none border-0"
              >
                <Eye className="w-4 h-4 mr-1" />
                Visualizar
              </Button>
              <Button
                variant={editorMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditorMode('split')}
                className="rounded-none border-0"
              >
                <Settings className="w-4 h-4 mr-1" />
                Dividido
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* Action Buttons */}
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Block Palette - Left Sidebar */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <BlockPalette onAddBlock={addBlock} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
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
              className="p-6"
            />
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-2 h-full">
              <div className="border-r border-gray-200">
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
              <div className="overflow-y-auto">
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
