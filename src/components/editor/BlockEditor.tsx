// ABOUTME: Core block editor component with drag-and-drop, string ID support, and layout management
// Handles rendering and interaction of various review blocks.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { GridPosition, LayoutRowData, Grid2DLayout } from '@/types/grid';
import { SingleBlock } from './blocks/SingleBlock';
import { BlockList } from './BlockList';
import { LayoutGrid } from './layout/LayoutGrid';
import { Grid2DContainer } from './layout/Grid2DContainer';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, directionOrIndex: 'up' | 'down' | number) => void;
  onAddBlock: (type: BlockType, position?: number) => string;
  onDuplicateBlock: (blockId: string) => void;
  onConvertToGrid: (blockId: string, columns: number) => void;
  onConvertTo2DGrid: (blockId: string, columns: number, rows: number) => void;
  onMergeBlockIntoGrid: (draggedBlockId: string, targetRowId: string, targetPosition?: number) => void;
  onPlaceBlockIn2DGrid: (blockId: string, gridId: string, position: GridPosition) => void;
  className?: string;
  readonly?: boolean;
}

const isLayoutBlock = (block: ReviewBlock): boolean => {
  return block.type === 'layout_grid' || block.type === 'grid_2d';
};

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
  className,
  readonly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInternalMove = useCallback((draggedBlockId: string, targetBlockId: string | null, dropPosition: 'before' | 'after' | 'over') => {
    const targetIndex = blocks.findIndex(b => b.id === targetBlockId);

    if (draggedBlockId === targetBlockId && dropPosition !== 'over') {
      return;
    }

    if (dropPosition === 'over' && targetBlockId) {
        const targetBlock = blocks.find(b => b.id === targetBlockId);
        const draggedBlock = blocks.find(b => b.id === draggedBlockId);
        if (targetBlock && draggedBlock && !isLayoutBlock(targetBlock) && !isLayoutBlock(draggedBlock)) {
            // This is a placeholder for a merge or convert-to-grid action
            // For now, let's treat it as dropping 'after' for simplicity in BlockList context
            // More complex logic (e.g., calling onMergeBlockIntoGrid or onConvertToGrid) would go here.
            // If BlockList is the one calling this, 'over' might mean "merge into this block"
            // which BlockList's onMoveBlock doesn't directly support.
            // For now, assume simple reorder if it's not a grid operation.
            if (targetIndex !== -1) {
                onMoveBlock(draggedBlockId, targetIndex + (targetBlockId === draggedBlockId ? 0 : 1));
            }
            return;
        }
    }
    
    if (targetBlockId === null) { // Dropped on an empty area or an insert line not related to a specific block
        // This logic is typically handled by specific drop zones (e.g., top/bottom of BlockList)
        // For a general editor drop, it might mean appending to the end if not handled by specific zones.
        // The `handleDrop` in BlockList passes `null` for `targetId` when dropping on insert lines
        // that are not 'between' two specific blocks (e.g. very top or very bottom).
        if (dropPosition === 'before') { // Top of the list
             onMoveBlock(draggedBlockId, 0);
        } else { // Bottom of the list or unspecific position
             onMoveBlock(draggedBlockId, blocks.length);
        }
        return;
    }


    if (targetIndex !== -1) {
      if (dropPosition === 'before') {
        onMoveBlock(draggedBlockId, targetIndex);
      } else { // 'after' or 'over' (if not handled as merge)
        onMoveBlock(draggedBlockId, targetIndex + 1);
      }
    } else {
      // Fallback if targetId is not found but was provided (e.g. from a stale drag state)
      // Or if dropping at the very start/end of list when blocks array is empty
      if (blocks.length === 0 && dropPosition === 'before') {
        onMoveBlock(draggedBlockId, 0);
      } else {
        onMoveBlock(draggedBlockId, blocks.length); // Append to end
      }
    }
  }, [blocks, onMoveBlock, onMergeBlockIntoGrid]);

  const { dragState, handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDrop, handleDragLeave } =
    useBlockDragDrop({ onMove: handleInternalMove });

  // Handle drag start from BlockList (individual blocks)
  const handleBlockListItemDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    handleDragStart(e, blockId);
  }, [handleDragStart]);

  // Global drop handler for the editor area (catches drops not on specific targets)
  const handleEditorDrop = useCallback((e: React.DragEvent) => {
    handleDrop(e); // Delegate to the hook's drop handler
  }, [handleDrop]);

  const handleEditorDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
    // Potentially set a general "editor area" drag over state if needed
    // For now, specific drag over targets (BlockList items, insert lines) are more critical
  };
  
  const handleAddBlockToList = useCallback((type: BlockType, index?: number) => {
    onAddBlock(type, index);
  }, [onAddBlock]);

  // ... keep existing code (renderLayoutGrid, renderGrid2DContainer with one change)
  const renderLayoutGrid = (block: ReviewBlock) => {
    if (block.type !== 'layout_grid' || !block.content?.rows) {
      console.warn('renderLayoutGrid called with invalid block:', block);
      return null;
    }
    const layoutRows = block.content.rows as LayoutRowData[];

    return (
      <LayoutGrid
        key={block.id}
        rows={layoutRows}
        onUpdateRow={(rowId, updates) => {
          const updatedRows = layoutRows.map(r => r.id === rowId ? { ...r, ...updates } : r);
          onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
        }}
        onDeleteRow={(rowId) => {
          const updatedRows = layoutRows.filter(r => r.id !== rowId);
          // Also delete blocks within the row from the main blocks array
          const rowToDelete = layoutRows.find(r => r.id === rowId);
          if (rowToDelete) {
            rowToDelete.blocks.forEach(b => onDeleteBlock(b.id));
          }
          onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
          if (updatedRows.length === 0) { // If grid becomes empty, delete the grid block itself
            onDeleteBlock(block.id);
          }
        }}
        onAddRow={(position, columns = 1) => {
          const newRowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          const newRow: LayoutRowData = { 
            id: newRowId, 
            blocks: [], 
            columns, 
            columnWidths: Array(columns).fill(100/columns),
            gap: 4 // Default gap
          };
          const insertAt = position !== undefined ? position : layoutRows.length;
          const updatedRows = [...layoutRows.slice(0, insertAt), newRow, ...layoutRows.slice(insertAt)];
          onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
        }}
        onAddBlockToRow={(rowId, blockPositionInRow, blockType) => {
          const newBlockId = onAddBlock(blockType as BlockType, undefined); // Add to main list first
          
          // Logic to move this newBlockId into the specified row and position
          // This might involve updating the `meta.layout.row_id` of the new block
          // and then updating the LayoutGrid's content.
          // For simplicity, we'll assume onMergeBlockIntoGrid can handle this type of placement
          // by interpreting targetRowId and targetPosition.
          onMergeBlockIntoGrid(newBlockId, rowId, blockPositionInRow);
        }}
        onUpdateBlockInRow={onUpdateBlock} 
        onMoveBlockInGrid={onMergeBlockIntoGrid} // map to onMergeBlockIntoGrid
        onDeleteBlockInRow={(blockIdToDelete, rowId) => {
            // This function should remove the block from the row's block array
            // And then call the global onDeleteBlock
            const updatedRows = layoutRows.map(r => {
                if (r.id === rowId) {
                    return { ...r, blocks: r.blocks.filter(b => b.id !== blockIdToDelete) };
                }
                return r;
            });
            onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows }});
            onDeleteBlock(blockIdToDelete); // Delete from global state
        }}
        readonly={readonly}
        activeBlockId={activeBlockId} 
        onActiveBlockChange={onActiveBlockChange} 
      />
    );
  };

  const renderGrid2DContainer = (block: ReviewBlock) => {
    if (block.type !== 'grid_2d' || !block.content) {
      console.warn('renderGrid2DContainer called with invalid block:', block);
      return null;
    }
    const gridLayout = block.content as Grid2DLayout;

    return (
      <Grid2DContainer
        key={block.id}
        grid={block.id} // Changed from gridId to grid
        initialLayout={gridLayout}
        activeBlockId={activeBlockId}
        onActiveBlockChange={onActiveBlockChange}
        onUpdateBlock={(childBlockId, updates) => {
          onUpdateBlock(childBlockId, updates);
        }}
        onDeleteBlock={(childBlockId) => {
          onDeleteBlock(childBlockId);
        }}
        onAddBlock={(gridId, position) => {
          const newBlockId = onAddBlock('paragraph', undefined);
          onPlaceBlockIn2DGrid(newBlockId, gridId, position);
        }}
        onLayoutChange={(newLayout) => {
          onUpdateBlock(block.id, { content: newLayout });
        }}
        readonly={readonly}
      />
    );
  };

  const DEFAULT_BLOCK_TYPE: BlockType = 'paragraph';
  
  // Filter out blocks that are part of a layout_grid or grid_2d from direct rendering in BlockList
  // These blocks are rendered within their respective layout components.
  const topLevelBlocks = blocks.filter(block => {
    if (block.meta?.layout?.row_id) { // Part of a 1D LayoutGrid row
        // Check if the parent grid still exists
        const parentGrid = blocks.find(b => b.type === 'layout_grid' && b.content?.rows?.some((r: LayoutRowData) => r.id === block.meta?.layout?.row_id));
        return !parentGrid; // Only show if orphaned
    }
    if (block.meta?.layout?.grid_id && block.meta?.layout?.grid_position) { // Part of a 2D Grid
         // Check if the parent 2D grid still exists
        const parent2DGrid = blocks.find(b => b.id === block.meta?.layout?.grid_id && b.type === 'grid_2d');
        return !parent2DGrid; // Only show if orphaned
    }
    return true; // Not part of any known grid structure, or is a grid container itself
  });


  return (
    <div
      ref={editorRef}
      className={cn("block-editor relative p-2 space-y-1 overflow-y-auto h-full flex-grow block-editor-droppable-area", className)}
      onDragOver={handleEditorDragOver}
      onDrop={handleEditorDrop} // Use the global drop handler
      onDragLeave={handleDragLeave}
    >
      {topLevelBlocks.map((block, index) => (
        <div key={block.id} className="block-wrapper">
          {/* Insert line before each block */}
           <div 
                className="insert-point-editor group w-full h-3 my-0.5"
                onDragOver={(e) => handleDragOver(e, block.id, 'before')}
                onDragEnter={(e) => handleDragEnter(e, block.id, 'before')} // For immediate feedback
                onDrop={handleEditorDrop} // Use the global drop handler
            >
                {dragState.isDragging && dragState.dragOverItemId === block.id && dragState.dropPosition === 'before' && (
                     <div className="h-full w-full bg-blue-500/30 rounded opacity-100 transition-opacity" />
                )}
            </div>

          {isLayoutBlock(block) ? (
            block.type === 'layout_grid' ? renderLayoutGrid(block) : renderGrid2DContainer(block)
          ) : (
            <div 
              draggable // Make individual non-layout blocks draggable
              onDragStart={(e) => handleBlockListItemDragStart(e, block.id)}
              onDragEnd={handleDragEnd}
              // Drag over for merging or specific interactions with SingleBlock might be needed
              // For now, reordering is handled by insert lines.
              onDragOver={(e) => handleDragOver(e, block.id, 'over')} // Allow dropping 'over' for potential merge
              onDrop={handleEditorDrop}
            >
              <SingleBlock
                block={block}
                isActive={activeBlockId === block.id}
                onSelect={() => onActiveBlockChange(block.id)}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                onMoveBlock={(id, dir) => onMoveBlock(id, dir as 'up' | 'down')} // SingleBlock simple move
                onDuplicateBlock={onDuplicateBlock}
                onConvertToGrid={onConvertToGrid}
                onConvertTo2DGrid={onConvertTo2DGrid}
                isFirst={index === 0}
                isLast={index === topLevelBlocks.length - 1}
                readonly={readonly}
              />
            </div>
          )}
        </div>
      ))}
      {/* Insert line at the very end */}
      <div 
        className="insert-point-editor group w-full h-3 my-0.5"
        onDragOver={(e) => handleDragOver(e, null, 'after')} // Null targetId, 'after' implies end of list
        onDragEnter={(e) => handleDragEnter(e, null, 'after')}
        onDrop={handleEditorDrop}
      >
        {dragState.isDragging && dragState.dragOverItemId === null && dragState.dropPosition === 'after' && (
            <div className="h-full w-full bg-blue-500/30 rounded opacity-100 transition-opacity" />
        )}
      </div>

      {blocks.length === 0 && !readonly && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-center p-6 border-2 border-dashed border-gray-700 rounded-lg">
            <Plus className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-300 mb-1">Editor Vazio</h3>
            <p className="mb-3 text-sm">Arraste blocos da paleta ou clique abaixo para adicionar.</p>
            <Button
              onClick={() => handleAddBlockToList(DEFAULT_BLOCK_TYPE, 0)}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Bloco
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
