// ABOUTME: Enhanced block editor with complete 2D grid support and dynamic layout
// Main editor with full grid functionality and responsive design - UPDATED: Reduced spacing by 50%

import React, { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { SingleBlock } from './blocks/SingleBlock';
// Import ResizableGridProps from LayoutGrid where it's now defined (or keep it local if preferred)
import { ResizableGridProps } from './layout/LayoutGrid'; // Use the one from LayoutGrid
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
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => string;
  onDuplicateBlock: (blockId: string) => void;
  onConvertToGrid?: (blockId: string, columns: number) => void;
  onConvertTo2DGrid?: (blockId: string, columns: number, rows: number) => void;
  onMergeBlockIntoGrid?: (draggedBlockId: string, targetRowId: string, targetPosition?: number) => void;
  onPlaceBlockIn2DGrid?: (blockId: string, gridId: string, position: GridPosition) => void;
  className?: string;
}

// DragState definition (can be moved to a types file if shared)
interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null; // For 1D grid rows
  dragOverGridId: string | null; // For 2D grids
  dragOverPosition: number | GridPosition | null; // Index for 1D, GridPosition for 2D
  isDragging: boolean;
  draggedFromRowId: string | null; // Source row_id for 1D
  draggedFromGridId: string | null; // Source grid_id for 2D
  draggedFromPosition: GridPosition | null; // Source position in 2D grid
  dropTargetType: 'grid' | '2d-grid-cell' | 'single' | 'merge' | null;
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
    dragOverGridId: null,
    dragOverPosition: null,
    isDragging: false,
    draggedFromRowId: null,
    draggedFromGridId: null,
    draggedFromPosition: null,
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
    isBlockInGrid,
    // Add missing functions if needed based on ResizableGrid usage
    handleDragStart: handleGridDragStart,
    handleDragOver: handleGridDragOver,
    handleDrop: handleGridDrop,
    moveBlockToRow, // Assuming this exists or is part of the hook
  } = useGridLayoutManager({
    blocks,
    onUpdateBlock,
    onDeleteBlock,
    // onMoveBlock, // If grid manager handles internal moves
  });
  
  // 2D Grid management
  const {
    grids, // This is likely the state from the hook
    createGrid,
    addRowToGridById,
    removeRowFromGridById,
    placeBlockInGridById,
    removeBlockFromGridById,
    updateGridLayout,
    extractGridsFromBlocks,
    // Add drag handlers from useGrid2DManager
    handle2DGridDragStart,
    handle2DGridDragOverCell,
    handle2DGridDropInCell,
    handleAddBlockToGrid, // Added this based on Grid2DContainer usage
  } = useGrid2DManager({
    blocks, // Pass blocks to useGrid2DManager
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock // Pass onAddBlock
  });

  // Extract 2D grids from current blocks
  React.useEffect(() => {
    const extracted2DGrids = extractGridsFromBlocks(blocks);
    console.log('Extracted 2D grids from blocks:', extracted2DGrids.length);
    // The hook should internally manage the `grids` state based on `blocks`
  }, [blocks, extractGridsFromBlocks]);

  // Organize blocks into layout groups
  const layoutGroups = React.useMemo(() => {
    const groups: Array<{
      type: '1d-grid' | '2d-grid' | 'single';
      id: string; 
      blocks: ReviewBlock[];
      config?: any;
    }> = [];

    const processedBlockIds = new Set<string>();

    // First, handle 2D grids
    const currentGridsFromHook = extractGridsFromBlocks(blocks); // Use the hook's extraction
    currentGridsFromHook.forEach(grid => {
      if (grid.id && grid.rows.length > 0) { // Check if grid has an ID and rows
        const gridBlocks: ReviewBlock[] = [];
        grid.rows.forEach(row => row.cells.forEach(cell => {
          if (cell.block) {
            const fullBlock = blocks.find(b => b.id === cell.block?.id);
            if (fullBlock) {
              gridBlocks.push(fullBlock);
              processedBlockIds.add(fullBlock.id);
            }
          }
        }));

        if (gridBlocks.length > 0) {
          groups.push({
            type: '2d-grid',
            id: grid.id, // grid.id from Grid2DLayout
            blocks: gridBlocks, // All blocks belonging to this 2D grid
            config: { // Construct config for Grid2DContainer
              columns: grid.columns,
              columnWidths: grid.columnWidths,
              grid_rows: grid.grid_rows, // Renamed from rows
              gap: grid.gap,
              rowHeights: grid.rowHeights,
            }
          });
        }
      }
    });
    
    // Then handle 1D grids (rows from layoutState)
    layoutState.rows.forEach(row => {
      const rowBlocks = row.blocks.filter(b => !processedBlockIds.has(b.id));
      if (rowBlocks.length > 0) {
        rowBlocks.forEach(b => processedBlockIds.add(b.id));
        groups.push({
          type: '1d-grid',
          id: row.id,
          blocks: rowBlocks,
          config: {
            columns: row.columns,
            columnWidths: row.columnWidths,
            gap: layoutState.gap
          }
        });
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
        processedBlockIds.add(block.id); // Ensure it's added here too
      }
    });
    
    return groups.sort((a, b) => {
      const aMinSort = Math.min(...a.blocks.map(block => block.sort_index).filter(idx => idx !== undefined));
      const bMinSort = Math.min(...b.blocks.map(block => block.sort_index).filter(idx => idx !== undefined));
      if (isNaN(aMinSort) || isNaN(bMinSort)) return 0; // Handle cases where sort_index might be missing
      return aMinSort - bMinSort;
    });
  }, [blocks, layoutState, extractGridsFromBlocks]);

  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph'): string => {
    return onAddBlock(type, position);
  }, [onAddBlock]);

  // Drag and Drop Handlers
  const handleSingleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('text/plain', blockId);
    e.dataTransfer.effectAllowed = 'move';
    setDragState(prev => ({ ...prev, draggedBlockId: blockId, isDragging: true, dropTargetType: null, draggedFromRowId: null, draggedFromGridId: null, draggedFromPosition: null }));
    console.log('Drag Start Single:', blockId);
  };
  
  // ... keep existing drag/drop handlers, to be refined later
  // Placeholder for combined drop logic
  const handleGlobalDrop = (e: React.DragEvent, targetType: 'single' | '1d-grid' | '2d-grid-cell', targetInfo: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (processingDropRef.current) return;
    processingDropRef.current = true;

    const draggedBlockId = e.dataTransfer.getData('text/plain') || dragState.draggedBlockId;
    if (!draggedBlockId) {
      processingDropRef.current = false;
      return;
    }

    console.log(`Global Drop: Block ${draggedBlockId} onto ${targetType}`, targetInfo);

    // Logic to handle drop based on targetType and targetInfo
    // This will involve calling onMergeBlockIntoGrid, onPlaceBlockIn2DGrid, or onMoveBlock

    if (targetType === '1d-grid' && onMergeBlockIntoGrid && targetInfo.rowId) {
      onMergeBlockIntoGrid(draggedBlockId, targetInfo.rowId, targetInfo.position);
    } else if (targetType === '2d-grid-cell' && onPlaceBlockIn2DGrid && targetInfo.gridId && targetInfo.position) {
      onPlaceBlockIn2DGrid(draggedBlockId, targetInfo.gridId, targetInfo.position);
    } else if (targetType === 'single' && targetInfo.targetBlockId) {
      // Find indices and call onMoveBlock
      const draggedBlockIndex = blocks.findIndex(b => b.id === draggedBlockId);
      const targetBlockIndex = blocks.findIndex(b => b.id === targetInfo.targetBlockId);
      if (draggedBlockIndex !== -1 && targetBlockIndex !== -1) {
        // Simplified: move relative to target. This needs better index management or specific "move to position" logic.
        // For now, this call to onMoveBlock might not be suitable for all single block drop scenarios.
        // onMoveBlock(draggedBlockId, draggedBlockIndex < targetBlockIndex ? 'down' : 'up');
        // A more robust solution would be to insert at target position and re-index.
        // For now, let's rely on specific handlers in ResizableGrid or Grid2DContainer
      }
    }


    setDragState({ 
        draggedBlockId: null, 
        dragOverRowId: null, 
        dragOverGridId: null,
        dragOverPosition: null, 
        isDragging: false, 
        draggedFromRowId: null,
        draggedFromGridId: null,
        draggedFromPosition: null,
        dropTargetType: null 
    });
    
    // Debounce processingDropRef.current = false;
    setTimeout(() => {
      processingDropRef.current = false;
    }, 100);
  };

  const handleGlobalDragOver = (e: React.DragEvent, targetType: 'single' | '1d-grid' | '2d-grid-cell', targetInfo: any) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    if(dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    dragTimeoutRef.current = setTimeout(() => {
        setDragState(prev => ({
            ...prev,
            dropTargetType: targetType,
            dragOverRowId: targetType === '1d-grid' ? targetInfo.rowId : null,
            dragOverGridId: targetType === '2d-grid-cell' ? targetInfo.gridId : null,
            dragOverPosition: targetType === '1d-grid' ? targetInfo.position : (targetType === '2d-grid-cell' ? targetInfo.position : null),
        }));
    }, 50);
  };

  return (
    <div className={cn("block-editor overflow-y-auto p-1 space-y-1 h-full", className)} style={getEditorStyles()}>
      {layoutGroups.map((group, groupIndex) => (
        <div key={group.id} className="layout-group">
          {/* Insertion point before each group */}
          <div className="insert-point-group my-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-6 text-xs text-gray-500 hover:text-gray-400 opacity-50 hover:opacity-100 flex items-center justify-center"
              onClick={() => addBlockBetween(group.blocks[0]?.sort_index ?? blocks.length)}
            >
              <Plus className="w-3 h-3 mr-1" /> Insertar Bloque Aquí
            </Button>
          </div>

          {group.type === '1d-grid' && group.config && (
            <ResizableGrid
              rowId={group.id}
              blocks={group.blocks}
              columns={group.config.columns}
              columnWidths={group.config.columnWidths}
              gap={group.config.gap || 4}
              onUpdateLayout={(rowId, updates) => updateColumnWidths(rowId, updates.columnWidths || [])}
              onAddBlock={(rowId, position, blockType) => onAddBlock(blockType || 'paragraph', position)} // Simplified for ResizableGrid for now
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onMoveBlockToRow={moveBlockToRow} // Prop from useGridLayoutManager
              activeBlockId={activeBlockId}
              onActiveBlockChange={onActiveBlockChange} // Added prop
              // Drag and Drop related props
              dragState={dragState}
              onDragStart={(e, blockId, rowId) => handleGridDragStart(e, blockId, rowId)}
              onDragOver={(e, targetRowId, targetPosition) => handleGridDragOver(e, targetRowId, targetPosition)}
              onDrop={() => handleGridDrop()} // Simplified, original was (e, targetRowId, targetPosition) => handleGridDrop(e, targetRowId, targetPosition, dragState.draggedBlockId!)
            />
          )}

          {group.type === '2d-grid' && group.config && (
            <Grid2DContainer
              gridId={group.id}
              initialLayout={{ // Construct Grid2DLayout from group.config
                id: group.id,
                columns: group.config.columns,
                columnWidths: group.config.columnWidths,
                grid_rows: group.config.grid_rows,
                rowHeights: group.config.rowHeights,
                gap: group.config.gap,
                rows: grids.find(g => g.id === group.id)?.rows || [] // Get rows from useGrid2DManager state
              }}
              blocksInGrid={group.blocks}
              onUpdateLayout={(gridId, layoutUpdates) => updateGridLayout(gridId, layoutUpdates)}
              onAddRow={(gridId, rowIndex) => addRowToGridById(gridId, rowIndex)}
              onRemoveRow={(gridId, rowIndex) => removeRowFromGridById(gridId, rowIndex)}
              onAddBlock={(gridId, position, blockType) => handleAddBlockToGrid(gridId, position, blockType)}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              activeBlockId={activeBlockId}
              onActiveBlockChange={onActiveBlockChange}
              // Drag and Drop for 2D grid cells
              dragState={dragState}
              onDragStartCell={(blockId, gridId, position) => handle2DGridDragStart(blockId, gridId, position)}
              onDragOverCell={(gridId, position) => handle2DGridDragOverCell(gridId, position)}
              onDropInCell={(gridId, position) => handle2DGridDropInCell(gridId, position, dragState.draggedBlockId!)}
              onPlaceBlockInGrid={onPlaceBlockIn2DGrid} // Propagate this
            />
          )}

          {group.type === 'single' && group.blocks.map((block, blockIndex) => (
            <div 
              key={block.id} 
              className="single-block-wrapper"
              onDragOver={(e) => handleGlobalDragOver(e, 'single', { targetBlockId: block.id, position: block.sort_index })}
              onDrop={(e) => handleGlobalDrop(e, 'single', { targetBlockId: block.id, position: block.sort_index })}
            >
              <SingleBlock
                block={block}
                activeBlockId={activeBlockId}
                onActiveBlockChange={onActiveBlockChange}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                onMoveBlock={onMoveBlock}
                onDuplicateBlock={onDuplicateBlock}
                onAddBlockBetween={(position, type) => addBlockBetween(position, type)}
                onConvertToGrid={onConvertToGrid}
                onConvertTo2DGrid={onConvertTo2DGrid}
                globalIndex={blocks.findIndex(b => b.id === block.id)} // Calculate global index
                isDragging={dragState.draggedBlockId === block.id && dragState.isDragging}
                dragState={dragState} // Pass full drag state
                onDragStart={(e) => handleSingleBlockDragStart(e, block.id)}
              />
            </div>
          ))}
        </div>
      ))}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
          <Plus className="w-10 h-10 mb-2" />
          <p>Nenhum bloco adicionado ainda.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => addBlockBetween(0)}
          >
            Adicionar Primeiro Bloco
          </Button>
        </div>
      )}
       {/* Final insertion point if list is not empty */}
       {blocks.length > 0 && (
         <div className="insert-point-group my-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-6 text-xs text-gray-500 hover:text-gray-400 opacity-50 hover:opacity-100 flex items-center justify-center"
              onClick={() => addBlockBetween(blocks.length)}
            >
              <Plus className="w-3 h-3 mr-1" /> Insertar Bloque Aquí
            </Button>
          </div>
       )}
    </div>
  );
};
