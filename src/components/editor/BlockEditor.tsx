
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
  onConvertTo2DGrid?: (blockId: number, columns: number, rows: number) => void;
  onMergeBlockIntoGrid?: (draggedBlockId: number, targetRowId: string, targetPosition?: number) => void;
  onPlaceBlockIn2DGrid?: (blockId: number, gridId: string, position: GridPosition) => void;
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
  onConvertTo2DGrid,
  onMergeBlockIntoGrid,
  onPlaceBlockIn2DGrid,
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

  // Organize blocks into layout groups
  const layoutGroups = React.useMemo(() => {
    const groups: Array<{
      type: '1d-grid' | '2d-grid' | 'single';
      id: string;
      blocks: ReviewBlock[];
      config?: any;
    }> = [];

    const processedBlockIds = new Set<number>();

    // First, handle 2D grids
    const grid2DIds = new Set<string>();
    blocks.forEach(block => {
      const gridId = block.meta?.layout?.grid_id;
      if (gridId && !grid2DIds.has(gridId)) {
        grid2DIds.add(gridId);
        const gridBlocks = blocks.filter(b => b.meta?.layout?.grid_id === gridId);
        gridBlocks.forEach(b => processedBlockIds.add(b.id));
        
        groups.push({
          type: '2d-grid',
          id: gridId,
          blocks: gridBlocks,
          config: gridBlocks[0]?.meta?.layout
        });
      }
    });

    // Then handle 1D grids
    const rowIds = new Set<string>();
    blocks.forEach(block => {
      const rowId = block.meta?.layout?.row_id;
      if (rowId && !rowIds.has(rowId) && !processedBlockIds.has(block.id)) {
        rowIds.add(rowId);
        const rowBlocks = blocks.filter(b => b.meta?.layout?.row_id === rowId);
        rowBlocks.forEach(b => processedBlockIds.add(b.id));
        
        if (rowBlocks.length > 1 || (rowBlocks[0]?.meta?.layout?.columns ?? 1) > 1) {
          groups.push({
            type: '1d-grid',
            id: rowId,
            blocks: rowBlocks,
            config: rowBlocks[0]?.meta?.layout
          });
        }
      }
    });

    // Finally, handle single blocks
    blocks.forEach(block => {
      if (!processedBlockIds.has(block.id)) {
        groups.push({
          type: 'single',
          id: `single-${block.id}`,
          blocks: [block]
        });
      }
    });

    // Sort by minimum sort_index within each group
    return groups.sort((a, b) => {
      const aMinSort = Math.min(...a.blocks.map(block => block.sort_index));
      const bMinSort = Math.min(...b.blocks.map(block => block.sort_index));
      return aMinSort - bMinSort;
    });
  }, [blocks]);

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

  // 2D Grid operations - FIXED: Removed truthiness check on void function
  const handleAddBlockTo2DGrid = useCallback((gridId: string, position: GridPosition) => {
    console.log('Adding block to 2D grid:', { gridId, position });
    
    // Create a new block first
    const blockIndex = blocks.length;
    onAddBlock('paragraph', blockIndex);
    
    // Since onAddBlock doesn't return the block ID, we need to get the newly created block
    // The new block will be at the end of the array after the next render
    setTimeout(() => {
      // Get the last block which should be our newly created one
      const newBlocks = [...blocks];
      if (newBlocks.length > blockIndex) {
        const newBlock = newBlocks[newBlocks.length - 1];
        if (onPlaceBlockIn2DGrid) {
          onPlaceBlockIn2DGrid(newBlock.id, gridId, position);
        }
      }
    }, 100);
  }, [blocks, onAddBlock, onPlaceBlockIn2DGrid]);

  const handleAddRowAbove = useCallback((gridId: string, rowIndex: number) => {
    addRowToGridById(gridId, 'above', rowIndex);
  }, [addRowToGridById]);

  const handleAddRowBelow = useCallback((gridId: string, rowIndex: number) => {
    addRowToGridById(gridId, 'below', rowIndex);
  }, [addRowToGridById]);

  const handleRemoveRow = useCallback((gridId: string, rowIndex: number) => {
    removeRowFromGridById(gridId, rowIndex);
  }, [removeRowFromGridById]);

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

  // Handle drag over for 1D grids
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

  // Handle drag over for 2D grids
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

  // Handle drop for both 1D and 2D grids
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

      // Handle 2D grid drops
      if (targetRowId.startsWith('grid-') && onPlaceBlockIn2DGrid && targetPosition !== undefined) {
        // Convert linear position to grid position
        const gridBlocks = blocks.filter(b => b.meta?.layout?.grid_id === targetRowId);
        const columns = gridBlocks[0]?.meta?.layout?.columns || 2;
        const gridPosition: GridPosition = {
          row: Math.floor(targetPosition / columns),
          column: targetPosition % columns
        };
        
        onPlaceBlockIn2DGrid(dragState.draggedBlockId, targetRowId, gridPosition);
      } 
      // Handle 1D grid drops
      else if (onMergeBlockIntoGrid) {
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
  }, [dragState.draggedBlockId, onMergeBlockIntoGrid, onPlaceBlockIn2DGrid, blocks]);

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

      {/* Render layout groups in order */}
      {layoutGroups.map((group, groupIndex) => {
        const globalIndex = group.blocks.length > 0 ? 
          blocks.findIndex(b => b.id === group.blocks[0].id) : 0;

        if (group.type === '2d-grid') {
          // Find the grid from extracted grids
          const grid = grids.find(g => g.id === group.id);
          if (grid) {
            return (
              <div key={group.id} className="mx-2 mb-8">
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
                  onDrop={handleDrop}
                />
              </div>
            );
          }
        } else if (group.type === '1d-grid') {
          return (
            <div key={group.id} className="mx-2 mb-6">
              <ResizableGrid
                rowId={group.id}
                blocks={group.blocks}
                columns={group.config?.columns || group.blocks.length}
                gap={group.config?.gap || 4}
                columnWidths={group.config?.columnWidths}
                onUpdateLayout={updateColumnWidths}
                onAddBlock={addBlockToGrid}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                activeBlockId={activeBlockId}
                onActiveBlockChange={onActiveBlockChange}
                dragState={dragState}
                onDragOver={handleDragOver1D}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            </div>
          );
        } else {
          // Single block
          const block = group.blocks[0];
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
              onConvertTo2DGrid={onConvertTo2DGrid}
              onAddBlockBetween={addBlockBetween}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver1D}
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
