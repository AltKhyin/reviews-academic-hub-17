// ABOUTME: Enhanced block editor with complete 2D grid support and dynamic layout
// Main editor with full grid functionality and responsive design

import React, { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { SingleBlock } from './blocks/SingleBlock';
import { ResizableGrid } from './layout/ResizableGrid';
import { Grid2DContainer } from './layout/Grid2DContainer';
import { useGridLayoutManager } from '@/hooks/useGridLayoutManager';
import { useGrid2DManager } from '@/hooks/useGrid2DManager';
import { useEditorLayout } from '@/hooks/useEditorLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridPosition } from '@/types/grid';

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

  // Layout management
  const { getEditorStyles, isDividirMode } = useEditorLayout();

  // 1D Grid management
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

  // 2D Grid management
  const {
    grids,
    createGrid,
    addRowToGridById,
    removeRowFromGridById,
    placeBlockInGridById,
    removeBlockFromGridById,
    updateGridLayout,
    extractGridsFromBlocks
  } = useGrid2DManager({
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock
  });

  // Extract 2D grids from current blocks
  React.useEffect(() => {
    const extracted2DGrids = extractGridsFromBlocks(blocks);
    console.log('Extracted 2D grids from blocks:', extracted2DGrids.length);
  }, [blocks, extractGridsFromBlocks]);

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

  // 2D Grid operations
  const handleAddBlockTo2DGrid = useCallback((gridId: string, position: GridPosition) => {
    const blockIndex = blocks.length;
    onAddBlock('paragraph', blockIndex);
    
    // After block is created, place it in the grid
    setTimeout(() => {
      const newBlock = blocks[blockIndex];
      if (newBlock) {
        placeBlockInGridById(gridId, newBlock, position);
      }
    }, 100);
  }, [blocks, onAddBlock, placeBlockInGridById]);

  const handleAddRowAbove = useCallback((gridId: string, rowIndex: number) => {
    addRowToGridById(gridId, 'above', rowIndex);
  }, [addRowToGridById]);

  const handleAddRowBelow = useCallback((gridId: string, rowIndex: number) => {
    addRowToGridById(gridId, 'below', rowIndex);
  }, [addRowToGridById]);

  const handleRemoveRow = useCallback((gridId: string, rowIndex: number) => {
    removeRowFromGridById(gridId, rowIndex);
  }, [removeRowFromGridById]);

  // Convert single block to 2D grid
  const handleConvertTo2DGrid = useCallback((blockId: number, columns: number, rows: number) => {
    console.log('Converting block to 2D grid:', { blockId, columns, rows });
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) {
      console.error('Block not found for 2D grid conversion:', blockId);
      return;
    }

    // Create new 2D grid
    const newGrid = createGrid(columns, rows);
    
    // Place the original block in the first cell (0,0)
    placeBlockInGridById(newGrid.id, block, { row: 0, column: 0 });
    
    console.log('Created 2D grid:', newGrid.id);
  }, [blocks, createGrid, placeBlockInGridById]);

  // Handle drag start
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

  // Handle drag over for 1D grids (number position)
  const handleDragOver1D = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType: 'grid' | 'single' | 'merge' = 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.isDragging || !dragState.draggedBlockId) return;
    if (dragState.draggedFromRowId === targetRowId) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId,
      dragOverPosition: targetPosition || null,
      dropTargetType: targetType
    }));
  }, [dragState.isDragging, dragState.draggedBlockId, dragState.draggedFromRowId]);

  // Handle drag over for 2D grids (number position for compatibility)
  const handleDragOver2D = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.isDragging || !dragState.draggedBlockId) return;
    if (dragState.draggedFromRowId === targetRowId) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId,
      dragOverPosition: targetPosition || null,
      dropTargetType: targetType || 'merge'
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

  // Handle drop for 1D grids
  const handleDrop1D = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType: 'grid' | 'single' | 'merge' = 'merge') => {
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

  // Handle drop for 2D grids (number position for compatibility)
  const handleDrop2D = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    
    if (!dragState.draggedBlockId || processingDropRef.current) return;
    
    processingDropRef.current = true;
    
    try {
      // Handle 2D grid drop logic here
      if (targetPosition !== undefined && onMergeBlockIntoGrid) {
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
        onDragOver={handleDragOver1D}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop1D}
      />
    </div>
  );

  const render2DGrid = (grid: any) => (
    <div key={grid.id} className="mx-2 mb-8">
      <Grid2DContainer
        grid={grid}
        activeBlockId={activeBlockId}
        onActiveBlockChange={onActiveBlockChange}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        onAddBlock={handleAddBlockTo2DGrid}
        onAddRowAbove={handleAddRowAbove}
        onAddRowBelow={handleAddRowBelow}
        onRemoveRow={handleRemoveRow}
        onUpdateGridLayout={updateGridLayout}
        dragState={dragState}
        onDragOver={handleDragOver2D}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop2D}
      />
    </div>
  );

  return (
    <div 
      className={cn("block-editor py-6", className)}
      style={getEditorStyles()}
    >
      {/* Dynamic width indicator for Dividir mode */}
      {isDividirMode && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            Modo Dividir Ativo • Editor Expandido
          </div>
        </div>
      )}

      {/* Render 2D Grids */}
      {grids.map(grid => render2DGrid(grid))}
      
      {/* Render existing 1D grids and single blocks */}
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
              onConvertTo2DGrid={handleConvertTo2DGrid}
              onAddBlockBetween={addBlockBetween}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver1D}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop1D}
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
