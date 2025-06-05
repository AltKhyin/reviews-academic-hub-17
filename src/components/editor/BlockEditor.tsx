
// ABOUTME: Fixed block editor with proper drag and drop, state management, and grid operations
// Resolved UI freezing, merge issues, and event handling conflicts

import React, { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { DragHandle } from './DragHandle';
import { ResizableGrid } from './layout/ResizableGrid';
import { useGridLayoutManager } from '@/hooks/useGridLayoutManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Columns2,
  Columns3,
  Columns4,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock: (blockId: number) => void;
  onConvertToGrid?: (blockId: number, columns: number) => void;
  onMergeBlockIntoGrid?: (draggedBlockId: number, targetRowId: string, targetPosition?: number) => void;
  className?: string;
}

interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  onConvertToGrid,
  onMergeBlockIntoGrid,
  className
}) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedBlockId: null,
    dragOverRowId: null,
    dragOverPosition: null,
    isDragging: false,
    draggedFromRowId: null,
    dropTargetType: null
  });

  const dragTimeoutRef = useRef<NodeJS.Timeout>();
  const processingDropRef = useRef(false);

  // Grid layout manager - called unconditionally
  const {
    layoutState,
    updateColumnWidths,
    deleteBlockWithLayoutRepair,
    getRowByBlockId,
    isBlockInGrid
  } = useGridLayoutManager({
    blocks,
    onUpdateBlock,
    onDeleteBlock
  });

  console.log('BlockEditor render:', { 
    blocksCount: blocks.length, 
    layoutRows: layoutState.rows.length,
    activeBlockId,
    dragState 
  });

  // FIXED: Simplified block click handling
  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    const target = event.target as Element;
    const isInteractiveElement = target.closest(
      '.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select, [contenteditable], .grid-controls, .resizable-handle'
    );
    
    if (!isInteractiveElement) {
      event.stopPropagation();
      onActiveBlockChange(activeBlockId === blockId ? null : blockId);
    }
  }, [activeBlockId, onActiveBlockChange]);

  const handleBlockVisibilityToggle = useCallback((blockId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      onUpdateBlock(blockId, { visible: !block.visible });
    }
  }, [blocks, onUpdateBlock]);

  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
    console.log('Adding block between positions:', { position, type });
    onAddBlock(type, position);
  }, [onAddBlock]);

  const convertToLayout = useCallback((blockId: number, columns: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) {
      console.error('Block not found for grid conversion:', blockId);
      return;
    }

    if (isBlockInGrid(blockId)) {
      console.warn('Block is already in a grid layout:', blockId);
      return;
    }

    console.log('Converting block to grid layout:', { blockId, columns, blockType: block.type });
    
    if (onConvertToGrid) {
      onConvertToGrid(blockId, columns);
      setTimeout(() => {
        onActiveBlockChange(null);
      }, 100);
    } else {
      console.error('onConvertToGrid handler not provided');
    }
  }, [blocks, onConvertToGrid, isBlockInGrid, onActiveBlockChange]);

  const addBlockToGrid = useCallback((rowId: string, position: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for grid block addition:', rowId);
      return;
    }

    let insertionIndex: number;
    
    if (position === 0 && row.blocks.length === 0) {
      const allSingleRows = layoutState.rows.filter(r => r.id.startsWith('single-'));
      const rowBlocks = layoutState.rows
        .filter(r => !r.id.startsWith('single-'))
        .sort((a, b) => {
          const aMinSort = Math.min(...a.blocks.map(b => b.sort_index));
          const bMinSort = Math.min(...b.blocks.map(b => b.sort_index));
          return aMinSort - bMinSort;
        });
      
      const targetRowIndex = rowBlocks.findIndex(r => r.id === rowId);
      insertionIndex = targetRowIndex > 0 ? 
        Math.max(...rowBlocks[targetRowIndex - 1].blocks.map(b => blocks.findIndex(bl => bl.id === b.id))) + 1 :
        0;
    } else if (position < row.blocks.length) {
      const blockAtPosition = row.blocks[position];
      insertionIndex = blocks.findIndex(b => b.id === blockAtPosition.id);
    } else {
      const lastBlockInRow = row.blocks[row.blocks.length - 1];
      insertionIndex = lastBlockInRow ? 
        blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
        blocks.length;
    }

    console.log('Adding block to grid:', { rowId, position, insertionIndex, totalBlocks: blocks.length });
    onAddBlock('paragraph', insertionIndex);
  }, [layoutState.rows, blocks, onAddBlock]);

  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    if (processingDropRef.current) {
      e.preventDefault();
      return;
    }
    
    const sourceRow = getRowByBlockId(blockId);
    
    console.log('Drag started:', { blockId, sourceRowId: sourceRow?.id });
    
    setDragState({
      draggedBlockId: blockId,
      draggedFromRowId: sourceRow?.id || null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: true,
      dropTargetType: null
    });

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId,
      sourceRowId: sourceRow?.id || null
    }));

    document.body.classList.add('dragging');
  }, [getRowByBlockId]);

  const handleDragOver = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType: 'grid' | 'single' | 'merge' = 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.isDragging || !dragState.draggedBlockId) return;
    if (dragState.draggedFromRowId === targetRowId) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId,
      dragOverPosition: targetPosition ?? null,
      dropTargetType: targetType
    }));
  }, [dragState.isDragging, dragState.draggedBlockId, dragState.draggedFromRowId]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dragOverRowId: null,
        dragOverPosition: null,
        dropTargetType: null
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType: 'grid' | 'single' | 'merge' = 'merge') => {
    e.preventDefault();
    
    if (!dragState.draggedBlockId || processingDropRef.current) return;
    
    processingDropRef.current = true;
    
    try {
      console.log('Drop operation:', { 
        draggedBlockId: dragState.draggedBlockId, 
        targetRowId, 
        targetPosition, 
        dropType 
      });

      if (onMergeBlockIntoGrid) {
        onMergeBlockIntoGrid(dragState.draggedBlockId, targetRowId, targetPosition);
      }
    } finally {
      setDragState({
        draggedBlockId: null,
        dragOverRowId: null,
        dragOverPosition: null,
        isDragging: false,
        draggedFromRowId: null,
        dropTargetType: null
      });
      
      document.body.classList.remove('dragging');
      
      setTimeout(() => {
        processingDropRef.current = false;
      }, 200);
    }
  }, [dragState.draggedBlockId, onMergeBlockIntoGrid]);

  const handleDragEnd = useCallback(() => {
    document.body.classList.remove('dragging');
    
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    setDragState({
      draggedBlockId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: false,
      draggedFromRowId: null,
      dropTargetType: null
    });
    
    processingDropRef.current = false;
  }, []);

  // Create wrapper function for onUpdate
  const createBlockUpdateWrapper = useCallback((blockId: number) => {
    return (updates: Partial<ReviewBlock>) => {
      onUpdateBlock(blockId, updates);
    };
  }, [onUpdateBlock]);

  // Render single block
  const renderSingleBlock = (block: ReviewBlock, globalIndex: number) => {
    const isActive = activeBlockId === block.id;
    const isDragging = dragState.draggedBlockId === block.id;
    const rowId = `single-${block.id}`;
    const isDropTarget = dragState.dragOverRowId === rowId && dragState.dropTargetType === 'merge';

    return (
      <div key={block.id} className="relative group mb-6 mx-4">
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-10 animate-pulse bg-green-500/10">
            <div className="absolute top-2 left-2 text-xs text-green-400 font-medium">
              Soltar para criar grid
            </div>
          </div>
        )}

        <div className="flex justify-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addBlockBetween(globalIndex)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white h-6 w-16 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        <Card 
          className={cn(
            "p-4 transition-all duration-200 cursor-pointer relative",
            isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
            !block.visible && "opacity-50",
            isDragging && "opacity-30 scale-95"
          )}
          style={{ 
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
            borderColor: isActive ? '#3b82f6' : '#2a2a2a',
            marginLeft: '2rem' // Add left margin for drag handle space
          }}
          onClick={(e) => handleBlockClick(block.id, e)}
          onDragOver={(e) => handleDragOver(e, rowId, 0, 'merge')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, rowId, 0, 'merge')}
        >
          {/* Drag Handle - positioned in the left margin */}
          <div className="absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              className="drag-handle cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center rounded border bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
              style={{ width: '20px', height: '20px' }}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragEnd={handleDragEnd}
              title="Arrastar bloco"
            >
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
          </div>

          {/* Block Actions - top right */}
          <div className={cn(
            "absolute top-2 right-2 flex items-center gap-1 transition-opacity z-10",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <div className="flex items-center gap-1 mr-2">
              {[2, 3, 4].map((cols) => {
                const Icon = cols === 2 ? Columns2 : cols === 3 ? Columns3 : Columns4;
                return (
                  <Button
                    key={cols}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => convertToLayout(block.id, cols, e)}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-blue-700"
                    title={`Converter para ${cols} colunas`}
                  >
                    <Icon className="w-3 h-3" />
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleBlockVisibilityToggle(block.id, e)}
              className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
              title={block.visible ? "Ocultar" : "Mostrar"}
            >
              {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateBlock(block.id);
              }}
              className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
              title="Duplicar"
            >
              <Copy className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBlock(block.id);
              }}
              className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
              title="Deletar"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <BlockRenderer
            block={block}
            onUpdate={createBlockUpdateWrapper(block.id)}
            readonly={false}
          />
        </Card>
      </div>
    );
  };

  // Render grid row
  const renderGridRow = (row: { id: string; blocks: ReviewBlock[]; columns: number; gap: number; columnWidths?: number[] }) => (
    <div key={row.id} className="mx-4 mb-6">
      <ResizableGrid
        rowId={row.id}
        blocks={row.blocks}
        columns={row.columns}
        gap={row.gap}
        columnWidths={row.columnWidths}
        onUpdateLayout={updateColumnWidths}
        onAddBlock={addBlockToGrid}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        activeBlockId={activeBlockId}
        onActiveBlockChange={onActiveBlockChange}
        dragState={dragState}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );

  return (
    <div className={cn("block-editor py-6", className)}>
      {layoutState.rows.map((row, index) => {
        if (row.columns > 1) {
          return renderGridRow(row);
        } else {
          const block = row.blocks[0];
          const globalIndex = blocks.findIndex(b => b.id === block.id);
          return renderSingleBlock(block, globalIndex);
        }
      })}

      <div className="flex justify-center mt-8 pt-4">
        <Button
          onClick={() => addBlockBetween(blocks.length)}
          variant="outline"
          className="text-gray-400 border-gray-600 hover:border-gray-500 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloco
        </Button>
      </div>
    </div>
  );
};
