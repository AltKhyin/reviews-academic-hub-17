// ABOUTME: Enhanced block editor with comprehensive layout support - FIXED: String IDs throughout
// Main editor component managing block rendering, drag-and-drop, and layout operations

import React, { useState, useCallback, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { GridPosition } from '@/types/grid';
import { SingleBlock } from './blocks/SingleBlock';
import { LayoutRow } from './layout/LayoutRow';
import { Grid2DPanel } from './layout/Grid2DPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => string;
  onDuplicateBlock: (blockId: string) => void;
  onConvertToGrid: (blockId: string, columns: number) => void;
  onConvertTo2DGrid: (blockId: string, columns: number, rows: number) => void;
  onMergeBlockIntoGrid: (draggedBlockId: string, targetRowId: string, targetPosition?: number) => void;
  onPlaceBlockIn2DGrid: (blockId: string, gridId: string, position: GridPosition) => void;
  className?: string;
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

  // Layout management
  // const { getEditorStyles, isDividirMode } = useEditorLayout();

  // 1D Grid management
  // const {
  //   layoutState,
  //   updateColumnWidths,
  //   getRowByBlockId,
  //   isBlockInGrid
  // } = useGridLayoutManager({
  //   blocks,
  //   onUpdateBlock,
  //   onDeleteBlock
  // });

  // 2D Grid management
  // const {
  //   grids,
  //   createGrid,
  //   addRowToGridById,
  //   removeRowFromGridById,
  //   placeBlockInGridById,
  //   removeBlockFromGridById,
  //   updateGridLayout,
  //   extractGridsFromBlocks
  // } = useGrid2DManager({
  //   onUpdateBlock,
  //   onDeleteBlock,
  //   onAddBlock
  // });

  // Extract 2D grids from current blocks
  // React.useEffect(() => {
  //   const extracted2DGrids = extractGridsFromBlocks(blocks);
  //   console.log('Extracted 2D grids from blocks:', extracted2DGrids.length);
  // }, [blocks, extractGridsFromBlocks]);

  // Organize blocks by layout type
  const organizedBlocks = useMemo(() => {
    const singleBlocks: ReviewBlock[] = [];
    const rowGroups: { [rowId: string]: ReviewBlock[] } = {};
    const gridGroups: { [gridId: string]: ReviewBlock[] } = {};

    blocks.forEach(block => {
      const layout = block.meta?.layout;
      
      if (layout?.grid_id) {
        // 2D Grid block
        if (!gridGroups[layout.grid_id]) {
          gridGroups[layout.grid_id] = [];
        }
        gridGroups[layout.grid_id].push(block);
      } else if (layout?.row_id) {
        // 1D Grid (row) block
        if (!rowGroups[layout.row_id]) {
          rowGroups[layout.row_id] = [];
        }
        rowGroups[layout.row_id].push(block);
      } else {
        // Single block
        singleBlocks.push(block);
      }
    });

    // Sort blocks within each group
    Object.keys(rowGroups).forEach(rowId => {
      rowGroups[rowId].sort((a, b) => {
        const posA = a.meta?.layout?.position ?? 0;
        const posB = b.meta?.layout?.position ?? 0;
        return posA - posB;
      });
    });

    Object.keys(gridGroups).forEach(gridId => {
      gridGroups[gridId].sort((a, b) => {
        const posA = a.meta?.layout?.grid_position;
        const posB = b.meta?.layout?.grid_position;
        
        if (!posA || !posB) return 0;
        
        if (posA.row !== posB.row) {
          return posA.row - posB.row;
        }
        return posA.column - posB.column;
      });
    });

    return { singleBlocks, rowGroups, gridGroups };
  }, [blocks]);

  // const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
  //   return onAddBlock(type, position);
  // }, [onAddBlock]);

  // const addBlockToGrid = useCallback((rowId: string, position: number) => {
  //   const row = layoutState.rows.find(r => r.id === rowId);
  //   if (!row) return;

  //   let insertionIndex: number;
    
  //   if (position === 0 && row.blocks.length === 0) {
  //     const allSingleRows = layoutState.rows.filter(r => r.id.startsWith('single-'));
  //     const rowBlocks = layoutState.rows
  //       .filter(r => !r.id.startsWith('single-'))
  //       .sort((a, b) => {
  //         const aMinSort = Math.min(...a.blocks.map(b => b.sort_index));
  //         const bMinSort = Math.min(...b.blocks.map(b => b.sort_index));
  //         return aMinSort - bMinSort;
  //       });
      
  //     const targetRowIndex = rowBlocks.findIndex(r => r.id === rowId);
  //     insertionIndex = targetRowIndex > 0 ? 
  //       Math.max(...rowBlocks[targetRowIndex - 1].blocks.map(b => blocks.findIndex(bl => bl.id === b.id))) + 1 :
  //       0;
  //   } else if (position < row.blocks.length) {
  //     const blockAtPosition = row.blocks[position];
  //     insertionIndex = blocks.findIndex(b => b.id === blockAtPosition.id);
  //   } else {
  //     const lastBlockInRow = row.blocks[row.blocks.length - 1];
  //     insertionIndex = lastBlockInRow ? 
  //       blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
  //       blocks.length;
  //   }

  //   return onAddBlock('paragraph' as BlockType, insertionIndex);
  // }, [layoutState.rows, blocks, onAddBlock]);

  // 2D Grid operations - FIXED: Proper block creation and placement
  // const handleAddBlockTo2DGrid = useCallback((gridId: string, position: GridPosition) => {
  //   console.log('Adding block to 2D grid:', { gridId, position });
    
  //   // Create a new block first
  //   const newBlockId = onAddBlock('paragraph' as BlockType, blocks.length);
    
  //   // Place it in the 2D grid immediately using the returned block ID
  //   if (onPlaceBlockIn2DGrid && newBlockId) {
  //     console.log('Placing newly created block in 2D grid:', { newBlockId, gridId, position });
  //     onPlaceBlockIn2DGrid(newBlockId, gridId, position);
  //   } else {
  //     console.error('Failed to place block in 2D grid:', { newBlockId, onPlaceBlockIn2DGrid });
  //   }
  // }, [blocks, onAddBlock, onPlaceBlockIn2DGrid]);

  // const handleAddRowAbove = useCallback((gridId: string, rowIndex: number) => {
  //   addRowToGridById(gridId, 'above', rowIndex);
  // }, [addRowToGridById]);

  // const handleAddRowBelow = useCallback((gridId: string, rowIndex: number) => {
  //   addRowToGridById(gridId, 'below', rowIndex);
  // }, [addRowToGridById]);

  // const handleRemoveRow = useCallback((gridId: string, rowIndex: number) => {
  //   removeRowFromGridById(gridId, rowIndex);
  // }, [removeRowFromGridById]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    console.log('Drag start:', blockId);
    
    const block = blocks.find(b => b.id === blockId);
    const fromRowId = block?.meta?.layout?.row_id || 
                      block?.meta?.layout?.grid_id || 
                      `single-${blockId}`;
    
    setDragState({
      draggedBlockId: blockId,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: true,
      draggedFromRowId: fromRowId,
      dropTargetType: null
    });

    e.dataTransfer.setData('text/plain', blockId);
    e.dataTransfer.effectAllowed = 'move';
  }, [blocks]);

  const handleDragEnd = useCallback(() => {
    console.log('Drag end');
    setDragState({
      draggedBlockId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: false,
      draggedFromRowId: null,
      dropTargetType: null
    });
  }, []);

  const handleDragOver = useCallback((
    e: React.DragEvent, 
    targetRowId: string, 
    targetPosition?: number, 
    targetType?: 'grid' | 'single' | 'merge'
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId,
      dragOverPosition: targetPosition ?? null,
      dropTargetType: targetType || null
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as Element;
    const currentTarget = e.currentTarget as Element;
    
    if (!currentTarget.contains(relatedTarget)) {
      setDragState(prev => ({
        ...prev,
        dragOverRowId: null,
        dragOverPosition: null,
        dropTargetType: null
      }));
    }
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent, 
    targetRowId: string, 
    targetPosition?: number, 
    dropType?: 'grid' | 'single' | 'merge'
  ) => {
    e.preventDefault();
    
    const draggedBlockId = e.dataTransfer.getData('text/plain');
    
    if (!draggedBlockId || draggedBlockId === dragState.draggedBlockId) {
      console.log('Drop operation:', { 
        draggedBlockId, 
        targetRowId, 
        targetPosition, 
        dropType 
      });

      if (dropType === 'merge' || targetRowId.startsWith('row-') || targetRowId.startsWith('grid-')) {
        onMergeBlockIntoGrid(draggedBlockId, targetRowId, targetPosition);
      }
    }

    handleDragEnd();
  }, [dragState.draggedBlockId, onMergeBlockIntoGrid, handleDragEnd]);

  // Create a flat list of organized elements for rendering
  const createRenderList = useCallback(() => {
    const renderItems: Array<{
      type: 'single' | 'row' | 'grid';
      id: string;
      blocks: ReviewBlock[];
      globalIndex: number;
    }> = [];

    let globalIndex = 0;

    // Process all blocks in sort order to maintain proper positioning
    const sortedBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);
    const processedBlocks = new Set<string>();

    sortedBlocks.forEach(block => {
      if (processedBlocks.has(block.id)) return;

      const layout = block.meta?.layout;

      if (layout?.grid_id && organizedBlocks.gridGroups[layout.grid_id]) {
        // 2D Grid
        const gridBlocks = organizedBlocks.gridGroups[layout.grid_id];
        if (!processedBlocks.has(gridBlocks[0].id)) {
          renderItems.push({
            type: 'grid',
            id: layout.grid_id,
            blocks: gridBlocks,
            globalIndex
          });
          gridBlocks.forEach(b => processedBlocks.add(b.id));
          globalIndex++;
        }
      } else if (layout?.row_id && organizedBlocks.rowGroups[layout.row_id]) {
        // 1D Grid (row)
        const rowBlocks = organizedBlocks.rowGroups[layout.row_id];
        if (!processedBlocks.has(rowBlocks[0].id)) {
          renderItems.push({
            type: 'row',
            id: layout.row_id,
            blocks: rowBlocks,
            globalIndex
          });
          rowBlocks.forEach(b => processedBlocks.add(b.id));
          globalIndex++;
        }
      } else {
        // Single block
        renderItems.push({
          type: 'single',
          id: block.id,
          blocks: [block],
          globalIndex
        });
        processedBlocks.add(block.id);
        globalIndex++;
      }
    });

    return renderItems;
  }, [blocks, organizedBlocks]);

  const renderList = createRenderList();

  if (!blocks || blocks.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-400 mb-2">
            Nenhum bloco adicionado
          </p>
          <p className="text-sm text-gray-600">
            Use a paleta à esquerda para adicionar blocos ao editor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="block-editor-content p-4 space-y-4" style={{ minHeight: '100%' }}>
        {renderList.map((item) => {
          switch (item.type) {
            case 'single':
              return (
                <SingleBlock
                  key={item.id}
                  block={item.blocks[0]}
                  globalIndex={item.globalIndex}
                  activeBlockId={activeBlockId}
                  dragState={dragState}
                  onActiveBlockChange={onActiveBlockChange}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onConvertToGrid={onConvertToGrid}
                  onConvertTo2DGrid={onConvertTo2DGrid}
                  onAddBlockBetween={onAddBlock}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              );
            
            case 'row':
              return (
                <LayoutRow
                  key={item.id}
                  rowId={item.id}
                  blocks={item.blocks}
                  globalIndex={item.globalIndex}
                  activeBlockId={activeBlockId}
                  dragState={dragState}
                  onActiveBlockChange={onActiveBlockChange}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onAddBlockBetween={onAddBlock}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              );
            
            case 'grid':
              return (
                <Grid2DPanel
                  key={item.id}
                  gridId={item.id}
                  blocks={item.blocks}
                  globalIndex={item.globalIndex}
                  activeBlockId={activeBlockId}
                  dragState={dragState}
                  onActiveBlockChange={onActiveBlockChange}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onPlaceBlockIn2DGrid={onPlaceBlockIn2DGrid}
                  onAddBlockBetween={onAddBlock}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              );
            
            default:
              return null;
          }
        })}
      </div>
    </ScrollArea>
  );
};
