
// ABOUTME: Refactored block editor with improved drop zones and component separation
// Main editor with enhanced drag-and-drop functionality

import React, { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { SingleBlock } from './blocks/SingleBlock';
import { ResizableGrid } from './layout/ResizableGrid';
import { useGridLayoutManager } from '@/hooks/useGridLayoutManager';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

  const {
    layoutState,
    updateColumnWidths,
    getRowByBlockId,
    isBlockInGrid
  } = useGridLayoutManager({
    blocks,
    onUpdateBlock,
    onDeleteBlock
  });

  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
    onAddBlock(type, position);
  }, [onAddBlock]);

  const addBlockToGrid = useCallback((rowId: string, position: number) => {
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) return;

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

    onAddBlock('paragraph', insertionIndex);
  }, [layoutState.rows, blocks, onAddBlock]);

  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    if (processingDropRef.current) {
      e.preventDefault();
      return;
    }
    
    const sourceRow = getRowByBlockId(blockId);
    
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

  const renderGridRow = (row: { id: string; blocks: ReviewBlock[]; columns: number; gap: number; columnWidths?: number[] }) => (
    <div key={row.id} className="mx-2 mb-6">
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
          return (
            <SingleBlock
              key={block.id}
              block={block}
              globalIndex={globalIndex}
              activeBlockId={activeBlockId}
              dragState={dragState}
              onActiveBlockChange={onActiveBlockChange}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onDuplicateBlock={onDuplicateBlock}
              onConvertToGrid={onConvertToGrid!}
              onAddBlockBetween={addBlockBetween}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          );
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
