// ABOUTME: Enhanced native editor with improved block management and full screen support
// Provides comprehensive editing capabilities for native content blocks

import React, { useState, useCallback, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockEditor } from './BlockEditor';
import { BlockPalette } from './BlockPalette';
import { LivePreview } from './LivePreview';
import { BlockList } from './BlockList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  EyeOff, 
  List, 
  Settings,
  Maximize2,
  Minimize2,
  Layout,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPosition } from '@/types/grid';

interface NativeEditorProps {
  blocks: ReviewBlock[];
  onUpdateBlocks: (blocks: ReviewBlock[]) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  className?: string;
}

export const NativeEditor: React.FC<NativeEditorProps> = ({
  blocks = [], // Add default empty array
  onUpdateBlocks,
  onSave,
  isSaving = false,
  className
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getDefaultContentForType = (type: BlockType) => {
    switch (type) {
      case 'heading':
        return { text: 'Título' };
      case 'paragraph':
        return { content: 'Novo parágrafo' };
      case 'figure':
        return { src: '', alt: '' };
      case 'table':
        return { rows: [['', ''], ['', '']] };
      case 'callout':
        return { type: 'info', title: '', content: '' };
      case 'number_card':
        return { number: 0, label: '' };
      case 'reviewer_quote':
        return { quote: '', author: '' };
      case 'poll':
        return { question: '', options: [] };
      case 'citation_list':
        return { citations: [] };
      case 'snapshot_card':
        return { title: '', value: '' };
      case 'diagram':
        return { nodes: [], connections: [] };
      default:
        return {};
    }
  };

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    onUpdateBlocks(newBlocks);
  }, [blocks, onUpdateBlocks]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onUpdateBlocks(newBlocks);
  }, [blocks, onUpdateBlocks]);

  const handleMoveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === blockId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, movedBlock);

    // Update sort indices
    newBlocks.forEach((block, i) => {
      block.sort_index = i;
    });

    onUpdateBlocks(newBlocks);
  }, [blocks, onUpdateBlocks]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const index = blocks.findIndex(block => block.id === blockId);
    const newBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);

    // Update sort indices
    newBlocks.forEach((block, i) => {
      block.sort_index = i;
    });

    onUpdateBlocks(newBlocks);
  }, [blocks, onUpdateBlocks]);

  const handleAddBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlock: ReviewBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      content: getDefaultContentForType(type),
      sort_index: position !== undefined ? position : blocks.length,
      visible: true,
      meta: {}
    };

    const newBlocks = [...blocks];
    if (position !== undefined) {
      newBlocks.splice(position, 0, newBlock);
      // Update sort indices
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });
    } else {
      newBlocks.push(newBlock);
    }
    
    onUpdateBlocks(newBlocks);
    setActiveBlockId(newBlock.id);
    
    return newBlock.id;
  }, [blocks, onUpdateBlocks]);

  const handleConvertToGrid = useCallback((blockId: string, columns: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    handleUpdateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          columns: columns,
          row_id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }
    });
  }, [blocks, handleUpdateBlock]);

  const handleConvertTo2DGrid = useCallback((blockId: string, columns: number, rows: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    handleUpdateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          columns: columns,
          grid_rows: rows,
          grid_id: `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }
    });
  }, [blocks, handleUpdateBlock]);

  const handleMergeBlockIntoGrid = useCallback((draggedBlockId: string, targetRowId: string, targetPosition?: number) => {
    const draggedBlock = blocks.find(b => b.id === draggedBlockId);
    if (!draggedBlock) return;

    const targetRowBlocks = blocks.filter(b => b.meta?.layout?.row_id === targetRowId);
    const targetIndex = targetPosition !== undefined ? targetPosition : targetRowBlocks.length;

    // Update dragged block's meta
    handleUpdateBlock(draggedBlockId, {
      meta: {
        ...draggedBlock.meta,
        layout: {
          ...draggedBlock.meta?.layout,
          row_id: targetRowId,
          position: targetIndex
        }
      }
    });

    // Re-sort blocks
    const newBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);
    onUpdateBlocks(newBlocks);
  }, [blocks, handleUpdateBlock, onUpdateBlocks]);

  const handlePlaceBlockIn2DGrid = useCallback((blockId: string, gridId: string, position: GridPosition) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    handleUpdateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          grid_id: gridId,
          grid_position: position
        }
      }
    });
  }, [blocks, handleUpdateBlock]);

  const handleSaveBlocks = useCallback(async () => {
    if (onSave) {
      await onSave();
    }
  }, [onSave]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className={cn("native-editor h-full flex flex-col", className)}>
      <div 
        className="flex items-center justify-between p-3 border-b flex-shrink-0"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="flex items-center gap-3">
          <Layout className="w-4 h-4" style={{ color: '#10b981' }} />
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Editor Nativo
          </span>
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {blocks.length} blocos
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
            className={cn(
              "h-8 w-8 p-0",
              !showPalette && "bg-blue-600 text-white"
            )}
            title="Mostrar/Esconder Paleta"
          >
            <Palette className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBlockList(!showBlockList)}
            className={cn(
              "h-8 w-8 p-0",
              showBlockList && "bg-blue-600 text-white"
            )}
            title="Mostrar/Esconder Lista de Blocos"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "h-8 w-8 p-0",
              showPreview && "bg-blue-600 text-white"
            )}
            title="Mostrar/Esconder Preview"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? "Minimizar Editor" : "Maximizar Editor"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveBlocks}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex min-h-0">
        {showPalette && (
          <Card 
            className="w-64 flex-shrink-0 border-r overflow-y-auto"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a'
            }}
          >
            <CardContent className="p-3">
              <BlockPalette onBlockAdd={handleAddBlock} />
            </CardContent>
          </Card>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <BlockEditor
            blocks={blocks}
            activeBlockId={activeBlockId}
            onActiveBlockChange={setActiveBlockId}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onMoveBlock={handleMoveBlock}
            onAddBlock={handleAddBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onConvertToGrid={handleConvertToGrid}
            onConvertTo2DGrid={handleConvertTo2DGrid}
            onMergeBlockIntoGrid={handleMergeBlockIntoGrid}
            onPlaceBlockIn2DGrid={handlePlaceBlockIn2DGrid}
            className="flex-1 min-h-0"
          />
        </div>

        {showPreview && (
          <Card 
            className="w-80 flex-shrink-0 border-l overflow-hidden"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a'
            }}
          >
            <LivePreview 
              blocks={blocks} 
              activeBlockId={activeBlockId}
              onBlockUpdate={handleUpdateBlock}
              className="h-full"
            />
          </Card>
        )}
      </div>
    </div>
  );
};
