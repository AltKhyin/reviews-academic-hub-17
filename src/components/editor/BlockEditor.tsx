// ABOUTME: Enhanced block editor with complete 2D grid support and dynamic layout
// Main editor with full grid functionality and responsive design - UPDATED: Reduced spacing by 50%

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void; // For list-like movement
  onAddBlock: (type: BlockType, position?: number) => string; // Returns new block ID
  onDuplicateBlock: (blockId: string) => void;
  onConvertToGrid?: (blockId: string, columns: number) => void;
  onConvertTo2DGrid?: (blockId: string, columns: number, rows: number) => void;
  onMergeBlockIntoGrid?: (draggedBlockId: string, targetRowId: string, targetPosition?: number) => void;
  onPlaceBlockIn2DGrid?: (blockId: string, gridId: string, position: GridPosition) => void;
  className?: string;
}

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null; // Can be 1D grid rowId or 2D gridId
  dragOverPosition: number | null; // Can be column index (1D) or cell index (2D)
  isDragging: boolean;
  draggedFromRowId: string | null; // Original container (rowId or gridId)
  dropTargetType: 'grid' | 'single' | 'merge' | null; // Type of target
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock, // General list-like movement
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
    layoutState, // Contains 1D grid rows: { id: string, blocks: ReviewBlock[], columns: number ... }[]
    updateColumnWidths,
    // getRowByBlockId, // For 1D grids
    // isBlockInGrid // For 1D grids
  } = useGridLayoutManager({
    blocks,
    onUpdateBlock,
    onDeleteBlock
  });

  // 2D Grid management
  const {
    grids, // Array of Grid2DLayout
    addRowToGridById,
    removeRowFromGridById,
    // placeBlockInGridById, // This might be what onPlaceBlockIn2DGrid wraps
    // removeBlockFromGridById,
    updateGridLayout, // For 2D grid structure changes (e.g., column widths in 2D grid meta)
    extractGridsFromBlocks
  } = useGrid2DManager({
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock // Passed to create placeholder blocks in new 2D grid cells if needed
  });

  useEffect(() => {
    extractGridsFromBlocks(blocks);
  }, [blocks, extractGridsFromBlocks]);

  // Organize blocks into layout groups
  const layoutGroups = React.useMemo(() => {
    const groups: Array<{
      type: '1d-grid' | '2d-grid' | 'single';
      id: string; // rowId for 1D grid, gridId for 2D grid, block.id for single
      blocks: ReviewBlock[]; // blocks in this group
      config?: any; // layout config (columns, etc.)
    }> = [];
    const processedBlockIds = new Set<string>();

    // 1. Process 2D Grids (using the `grids` state from `useGrid2DManager`)
    grids.forEach(grid2D => {
      groups.push({
        type: '2d-grid',
        id: grid2D.id,
        blocks: blocks.filter(b => b.meta?.layout?.grid_id === grid2D.id), // Get all blocks for this grid
        config: grid2D // The whole Grid2DLayout object as config
      });
      blocks.filter(b => b.meta?.layout?.grid_id === grid2D.id).forEach(b => processedBlockIds.add(b.id));
    });
    
    // 2. Process 1D Grids (using `layoutState.rows` from `useGridLayoutManager`)
    layoutState.rows.forEach(row1D => {
      if (row1D.blocks.some(b => !processedBlockIds.has(b.id))) { // Ensure not already part of a 2D grid
         // And ensure it's actually a multi-column grid or explicitly defined as one
        if (row1D.columns > 1 || row1D.blocks.length > 1 || (row1D.blocks.length === 1 && row1D.blocks[0]?.meta?.layout?.columns && row1D.blocks[0]?.meta?.layout?.columns > 1) ) {
          groups.push({
            type: '1d-grid',
            id: row1D.id,
            blocks: row1D.blocks,
            config: { // Construct config from row1D properties
              columns: row1D.columns,
              columnWidths: row1D.blocks[0]?.meta?.layout?.columnWidths, // Assuming consistent within row
              gap: row1D.blocks[0]?.meta?.layout?.gap, // Assuming consistent
            }
          });
          row1D.blocks.forEach(b => processedBlockIds.add(b.id));
        }
      }
    });

    // 3. Process Single Blocks
    blocks.forEach(block => {
      if (!processedBlockIds.has(block.id)) {
        groups.push({
          type: 'single',
          id: block.id, // Use block.id as group id for singles
          blocks: [block],
          config: {}
        });
        processedBlockIds.add(block.id); // Though not strictly necessary here as it's the last step
      }
    });

    // Sort groups by the minimum sort_index of their first block to maintain visual order
    return groups.sort((a, b) => {
      const getMinSortIndex = (groupBlocks: ReviewBlock[]) => {
        if (groupBlocks.length === 0) return Infinity;
        // Find original block from the main `blocks` array to get its sort_index
        const originalBlock = blocks.find(mainBlock => mainBlock.id === groupBlocks[0].id);
        return originalBlock ? originalBlock.sort_index : Infinity;
      };
      return getMinSortIndex(a.blocks) - getMinSortIndex(b.blocks);
    });
  }, [blocks, grids, layoutState.rows]);

  const addBlockBetween = useCallback((overallPosition: number, type: BlockType = 'paragraph') => {
    // This adds a new block to the main `blocks` array at a given `sort_index`.
    // The new block will initially be a "single" block.
    return onAddBlock(type, overallPosition);
  }, [onAddBlock]);

  // For 1D Grids (ResizableGrid)
  const addBlockTo1DGridColumn = useCallback((rowId: string, columnIndex: number, type: BlockType = 'paragraph') => {
    // This needs to create a new block and then update its metadata to belong to this 1D grid row
    // and be at the specified column (effectively setting its sort_index relative to other blocks in that row).
    // The `onMergeBlockIntoGrid` or similar logic might be involved here after block creation.
    // For now, let's assume onAddBlock can handle initial placement or we adjust sort_index later.
    
    const row = layoutState.rows.find(r => r.id === rowId);
    if (!row) return;

    // Determine global insertion position
    let globalInsertPos = blocks.length;
    if (row.blocks.length > 0) {
      if (columnIndex < row.blocks.length && row.blocks[columnIndex]) {
        globalInsertPos = blocks.findIndex(b => b.id === row.blocks[columnIndex].id);
      } else if (row.blocks.length > 0) {
        globalInsertPos = blocks.findIndex(b => b.id === row.blocks[row.blocks.length - 1].id) + 1;
      }
    } else {
      // If row is empty, find where this row conceptually is in the main list
      // This is complex; for now, append and let sort_index handle it.
    }
    
    const newBlockId = onAddBlock(type, globalInsertPos);
    if (newBlockId && onMergeBlockIntoGrid) {
      // Place it into the 1D grid
      onMergeBlockIntoGrid(newBlockId, rowId, columnIndex);
    }
  }, [onAddBlock, onMergeBlockIntoGrid, blocks, layoutState.rows]);

  // For 2D Grids (Grid2DContainer -> Grid2DRow -> Grid2DCell)
  const handleAddBlockTo2DGridCell = useCallback((gridId: string, position: GridPosition) => {
    if (onPlaceBlockIn2DGrid) {
      // First, create a new block. It will be added to the end of the main `blocks` list.
      const newBlockId = onAddBlock('paragraph' as BlockType, blocks.length);
      // Then, tell `onPlaceBlockIn2DGrid` to move/assign this new block to the 2D grid cell.
      onPlaceBlockIn2DGrid(newBlockId, gridId, position);
    }
  }, [onAddBlock, onPlaceBlockIn2DGrid, blocks.length]);

  const handleAddRowAboveTo2DGrid = useCallback((gridId: string, rowIndex: number) => {
    addRowToGridById(gridId, 'above', rowIndex);
  }, [addRowToGridById]);

  const handleAddRowBelowTo2DGrid = useCallback((gridId: string, rowIndex: number) => {
    addRowToGridById(gridId, 'below', rowIndex);
  }, [addRowToGridById]);

  const handleRemoveRowFrom2DGrid = useCallback((gridId: string, rowIndex: number) => {
    removeRowFromGridById(gridId, rowIndex);
  }, [removeRowFromGridById]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    // ... (same as before, ensure blockId is string)
    if (processingDropRef.current) {
      e.preventDefault();
      return;
    }
    
    const block = getBlockById(blockId);
    if (!block) return;

    const sourceContainerId = block.meta?.layout?.grid_id || block.meta?.layout?.row_id || null;
    
    setDragState({
      draggedBlockId: blockId,
      draggedFromRowId: sourceContainerId, // Can be 1D rowId or 2D gridId
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: true,
      dropTargetType: null
    });

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
    // Add more info if needed, like original container type (1D/2D)
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId,
      sourceContainerId: sourceContainerId,
    }));

    document.body.classList.add('dragging');
  }, [blocks]);

  // Handle drag over for 1D grids
  const handleDragOver = useCallback((e: React.DragEvent, targetContainerId: string, targetPositionInContainer?: number, targetType: 'grid' | 'single' | 'merge' = 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.isDragging || !dragState.draggedBlockId) return;
    // Avoid dragging onto itself or its own immediate container if not changing position
    if (dragState.draggedBlockId === targetContainerId && targetType === 'single') return;
    if (dragState.draggedFromRowId === targetContainerId && dragState.dragOverPosition === targetPositionInContainer) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetContainerId, // This is the ID of the target group (1D row, 2D grid, or single block ID if dropping onto single)
      dragOverPosition: targetPositionInContainer ?? null, // e.g., column index in 1D, cell index in 2D
      dropTargetType: targetType
    }));
  }, [dragState.isDragging, dragState.draggedBlockId, dragState.draggedFromRowId, dragState.dragOverPosition]);

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
    // ... (same as before)
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;

    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      // Still inside the element or its children
      return;
    }
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: null,
      dragOverPosition: null,
      dropTargetType: null
    }));
  }, []);

  // Handle drop for both 1D and 2D grids - FIXED: Proper 2D grid integration
  const handleDrop = useCallback((e: React.DragEvent, targetContainerId: string, targetPositionInContainer?: number, dropType: 'grid' | 'single' | 'merge' = 'merge') => {
    e.preventDefault();
    if (!dragState.draggedBlockId || processingDropRef.current) return;
    
    processingDropRef.current = true;
    const draggedBlockId = dragState.draggedBlockId;

    console.log('Drop:', { draggedBlockId, targetContainerId, targetPositionInContainer, dropType });

    const targetGroup = layoutGroups.find(g => g.id === targetContainerId);

    if (targetGroup?.type === '2d-grid' && onPlaceBlockIn2DGrid && targetPositionInContainer !== undefined) {
      const gridConfig = targetGroup.config as Grid2DLayout;
      const columnsInGrid = gridConfig.columns || 2; // Default if not set
      const gridPos: GridPosition = {
        row: Math.floor(targetPositionInContainer / columnsInGrid),
        column: targetPositionInContainer % columnsInGrid,
      };
      onPlaceBlockIn2DGrid(draggedBlockId, targetContainerId, gridPos);
    } else if (targetGroup?.type === '1d-grid' && onMergeBlockIntoGrid) {
      onMergeBlockIntoGrid(draggedBlockId, targetContainerId, targetPositionInContainer);
    } else if (dropType === 'single' && targetContainerId !== draggedBlockId) { // Dropping onto a single block (implicitly means reordering)
      // Find index of targetContainerId (which is a blockId here)
      const targetBlockIndex = blocks.findIndex(b => b.id === targetContainerId);
      if (targetBlockIndex !== -1) {
        // This is complex: essentially moving block to sort_index of targetBlockIndex
        // This requires a more sophisticated onMoveBlock or direct manipulation + history.
        // For now, we assume onMoveBlock handles general up/down reordering based on overall list.
        // A true drop-onto-single might imply inserting before/after.
        // Let's simplify: If it's a single block, this drop might be for merging into a new grid
        // or handled by a generic moveBlock action if that's what it means.
        // If it means "move draggedBlockId to the position of targetContainerId",
        // this needs careful sort_index updates.
        console.warn("Drop onto single block - reordering logic needs to be robust via onMoveBlock or similar.");
        // Example: move dragged block to be before target block
        // This could be achieved by repeatedly calling onMoveBlock(draggedBlockId, 'up'/'down')
        // Or a more direct "moveToSortIndex" operation.
        // For now, this case is not fully handled by current props.
      }
    }
    
    setTimeout(() => { // Ensure state clear happens after potential updates
      setDragState({ draggedBlockId: null, dragOverRowId: null, dragOverPosition: null, isDragging: false, draggedFromRowId: null, dropTargetType: null });
      document.body.classList.remove('dragging');
      processingDropRef.current = false;
    }, 100);
  }, [dragState.draggedBlockId, blocks, layoutGroups, onMergeBlockIntoGrid, onPlaceBlockIn2DGrid, onMoveBlock]);

  const handleDragEnd = useCallback(() => {
    // ... (same as before)
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Check if drop occurred, if not, it might be a cancel
    if (dragState.isDragging && !processingDropRef.current) { // If no drop processed it
      setDragState({
        draggedBlockId: null,
        dragOverRowId: null,
        dragOverPosition: null,
        isDragging: false,
        draggedFromRowId: null,
        dropTargetType: null
      });
    }
    document.body.classList.remove('dragging');
    // processingDropRef.current should be reset by handleDrop
  }, [dragState.isDragging]);

  const getBlockById = (id: string) => blocks.find(b => b.id === id);

  return (
    <div 
      className={cn("block-editor py-3 overflow-hidden w-full max-w-full", className)}
      style={{
        backgroundColor: '#121212',
        color: '#ffffff',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
      onDragEnd={handleDragEnd} // Attach to the top-level container for drag end
    >
      {isDividirMode && (
        <div className="mb-2 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-gray-900/20 border border-gray-600/30 rounded-full text-gray-400 text-sm">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></span>
            Modo Dividir Ativo • Editor Expandido
          </div>
        </div>
      )}

      <div className="w-full max-w-full overflow-hidden space-y-1.5"> {/* Added space-y for consistent spacing like BlockList */}
        {layoutGroups.map((group, groupIndex) => {
          // Calculate overall starting sort_index for this group for "add block between"
          const overallBlockIndex = group.blocks.length > 0 ? 
            blocks.findIndex(b => b.id === group.blocks[0].id) : 
            (groupIndex > 0 ? blocks.findIndex(b => b.id === layoutGroups[groupIndex-1].blocks.slice(-1)[0]?.id) + 1 : 0);

          return (
            <div key={group.id} className="block-group-wrapper"> {/* Wrapper for each group */}
              {/* "Add Block Here" button - Top of first group */}
              {groupIndex === 0 && (
                <div className="flex justify-center my-1">
                  <Button onClick={() => addBlockBetween(0)} variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-300">
                    <Plus className="w-3 h-3 mr-1" /> Inserir Bloco Aqui
                  </Button>
                </div>
              )}

              {group.type === '2d-grid' ? (
                <div className="mx-2 mb-1 w-full max-w-full overflow-hidden"> {/* Reduced mb */}
                  <Grid2DContainer
                    grid={group.config as Grid2DLayout} // group.config is the Grid2DLayout object
                    activeBlockId={activeBlockId}
                    onActiveBlockChange={onActiveBlockChange}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteBlock={onDeleteBlock}
                    onAddBlock={handleAddBlockTo2DGridCell}
                    onAddRowAbove={handleAddRowAboveTo2DGrid}
                    onAddRowBelow={handleAddRowBelowTo2DGrid}
                    onRemoveRow={handleRemoveRowFrom2DGrid}
                    onUpdateGridLayout={updateGridLayout}
                    // Drag props for 2D grid cells
                    dragState={dragState}
                    onDragOver={handleDragOver} // Pass generic handler
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  />
                </div>
              ) : group.type === '1d-grid' ? (
                <div className="mx-2 mb-1 w-full max-w-full overflow-hidden"> {/* Reduced mb */}
                  <ResizableGrid
                    rowId={group.id}
                    blocks={group.blocks}
                    columns={group.config?.columns || group.blocks.length}
                    gap={group.config?.gap || 4}
                    columnWidths={group.config?.columnWidths}
                    onUpdateLayout={updateColumnWidths}
                    onAddBlock={addBlockTo1DGridColumn}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteBlock={onDeleteBlock}
                    activeBlockId={activeBlockId}
                    onActiveBlockChange={onActiveBlockChange}
                    // Drag props for 1D grid cells
                    dragState={dragState}
                    onDragOver={handleDragOver} // Pass generic handler
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  />
                </div>
              ) : ( // Single block
                <div className="w-full max-w-full overflow-hidden px-2"> {/* Added px-2 for consistency */}
                  <SingleBlock
                    block={group.blocks[0]}
                    // globalIndex={overallBlockIndex} // This might not be accurate due to grids.
                    activeBlockId={activeBlockId}
                    dragState={dragState}
                    onActiveBlockChange={onActiveBlockChange}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteBlock={onDeleteBlock}
                    onDuplicateBlock={onDuplicateBlock}
                    onConvertToGrid={onConvertToGrid}
                    onConvertTo2DGrid={onConvertTo2DGrid}
                    // addBlockBetween needs the overall index, not relative to this single block
                    onAddBlockBetween={(type, relativePos) => addBlockBetween(overallBlockIndex + (relativePos === 'after' ? 1: 0) , type) }
                    onDragStart={(e) => handleDragStart(e, group.blocks[0].id)}
                    // onDragEnd is handled by the main container
                    onDragOver={(e) => handleDragOver(e, group.blocks[0].id, undefined, 'single')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, group.blocks[0].id, undefined, 'single')}
                    onMoveBlock={onMoveBlock} // Pass general move for up/down arrows
                  />
                </div>
              )}
              {/* "Add Block Here" button - Between groups */}
              <div className="flex justify-center my-1">
                <Button onClick={() => addBlockBetween(overallBlockIndex + group.blocks.length)} variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-300">
                  <Plus className="w-3 h-3 mr-1" /> Inserir Bloco Aqui
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final "Add Block" button if list is empty or for end of list */}
      {layoutGroups.length === 0 && (
        <div className="flex justify-center mt-4 pt-2">
          <Button
            onClick={() => addBlockBetween(blocks.length)}
            variant="outline"
            className="text-gray-400 border-gray-600 hover:border-gray-500 hover:text-white"
            style={{
              backgroundColor: '#212121',
              borderColor: '#2a2a2a'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco Inicial
          </Button>
        </div>
      )}
    </div>
  );
};
