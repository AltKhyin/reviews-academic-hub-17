
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
  // FIXED: All hooks must be called at the top level in the same order every time
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

  // Grid layout manager - must be called after all useState hooks
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

  // FIXED: Improved block click handling with better event filtering
  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    const target = event.target as Element;
    
    // Enhanced interactive element detection
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

  // FIXED: Proper addBlockBetween with correct position calculation
  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
    console.log('Adding block between positions:', { position, type });
    onAddBlock(type, position);
  }, [onAddBlock]);

  // COMPLETELY FIXED: Grid conversion with proper validation and error handling
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
      
      // Clear active block to prevent stale UI state
      setTimeout(() => {
        onActiveBlockChange(null);
      }, 100);
    } else {
      console.error('onConvertToGrid handler not provided');
    }
  }, [blocks, onConvertToGrid, isBlockInGrid, onActiveBlockChange]);

  // FIXED: Proper grid block addition with correct position calculation
  const addBlockToGrid = useCallback((rowId: string, position: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for grid block addition:', rowId);
      return;
    }

    // Calculate the correct insertion index in the global blocks array
    let insertionIndex: number;
    
    if (position === 0 && row.blocks.length === 0) {
      // Empty grid - find where this row should be in the document
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
      // Insert before an existing block
      const blockAtPosition = row.blocks[position];
      insertionIndex = blocks.findIndex(b => b.id === blockAtPosition.id);
    } else {
      // Insert at the end of the row
      const lastBlockInRow = row.blocks[row.blocks.length - 1];
      insertionIndex = lastBlockInRow ? 
        blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
        blocks.length;
    }

    console.log('Adding block to grid:', { rowId, position, insertionIndex, totalBlocks: blocks.length });
    onAddBlock('paragraph', insertionIndex);
  }, [layoutState.rows, blocks, onAddBlock]);

  // FIXED: Enhanced drag start with proper state initialization
  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    // Prevent dragging during active processing
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

    // Set drag data for proper HTML5 drag and drop
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId.toString());
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId,
      sourceRowId: sourceRow?.id || null
    }));

    // Add visual drag state
    document.body.classList.add('dragging');
  }, [getRowByBlockId]);

  // FIXED: Enhanced drag over handling with proper target detection
  const handleDragOver = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType: 'grid' | 'single' | 'merge' = 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.isDragging || !dragState.draggedBlockId) return;
    
    // Don't allow dropping on self
    if (dragState.draggedFromRowId === targetRowId) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId,
      dragOverPosition: targetPosition ?? null,
      dropTargetType: targetType
    }));
  }, [dragState.isDragging, dragState.draggedBlockId, dragState.draggedFromRowId]);

  // FIXED: Clean drag leave handling
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if actually leaving the component area
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

  // COMPLETELY FIXED: Drop handling with proper merge logic
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
      // Clean up drag state
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

  // FIXED: Proper drag end cleanup
  const handleDragEnd = useCallback(() => {
    document.body.classList.remove('dragging');
    
    // Clear drag timeout if exists
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Reset drag state
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

  // Render single block with all controls
  const renderSingleBlock = useCallback((block: ReviewBlock, globalIndex: number) => {
    const isActive = activeBlockId === block.id;
    const isDragging = dragState.draggedBlockId === block.id;
    const rowId = `single-${block.id}`;
    const isDropTarget = dragState.dragOverRowId === rowId && dragState.dropTargetType === 'merge';

    return (
      <div key={block.id} className="relative group">
        {/* Drop zone indicator */}
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-10 animate-pulse bg-green-500/10">
            <div className="absolute top-2 left-2 text-xs text-green-400 font-medium">
              Soltar para criar grid
            </div>
          </div>
        )}

        {/* Add block button above */}
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

        {/* Block container */}
        <Card 
          className={cn(
            "p-4 transition-all duration-200 cursor-pointer relative",
            isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
            !block.visible && "opacity-50",
            isDragging && "opacity-30 scale-95"
          )}
          style={{ 
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
            borderColor: isActive ? '#3b82f6' : '#2a2a2a'
          }}
          onClick={(e) => handleBlockClick(block.id, e)}
          onDragOver={(e) => handleDragOver(e, rowId, 0, 'merge')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, rowId, 0, 'merge')}
        >
          {/* FIXED: Drag handle with proper drag events */}
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

          {/* Block controls */}
          <div className={cn(
            "absolute top-2 right-2 flex items-center gap-1 transition-opacity z-10",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            {/* Grid conversion buttons */}
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

            {/* Standard controls */}
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

          {/* Block content */}
          <BlockRenderer
            block={block}
            onUpdate={onUpdateBlock}
            readonly={false}
          />
        </Card>
      </div>
    );
  }, [activeBlockId, dragState, handleBlockClick, handleBlockVisibilityToggle, addBlockBetween, convertToLayout, onDuplicateBlock, onDeleteBlock, onUpdateBlock, handleDragOver, handleDragLeave, handleDrop, handleDragStart, handleDragEnd]);

  // Render grid row
  const renderGridRow = useCallback((row: { id: string; blocks: ReviewBlock[]; columns: number; gap: number; columnWidths?: number[] }) => (
    <ResizableGrid
      key={row.id}
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
  ), [updateColumnWidths, addBlockToGrid, onUpdateBlock, onDeleteBlock, activeBlockId, onActiveBlockChange, dragState, handleDragOver, handleDragLeave, handleDrop]);

  return (
    <div className={cn("block-editor space-y-6", className)}>
      {layoutState.rows.map((row, index) => {
        if (row.columns > 1) {
          // Grid row
          return renderGridRow(row);
        } else {
          // Single block row
          const block = row.blocks[0];
          const globalIndex = blocks.findIndex(b => b.id === block.id);
          return renderSingleBlock(block, globalIndex);
        }
      })}

      {/* Final add block button */}
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
