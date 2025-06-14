// ABOUTME: Core block editor component with drag-and-drop, string ID support, and layout management
// Handles rendering and interaction of various review blocks.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { GridPosition, LayoutRowData, Grid2DLayout } from '@/types/grid'; // Added Grid2DLayout import
import { SingleBlock } from './blocks/SingleBlock';
import { BlockList } from './BlockList'; // Assuming BlockList is in the same directory or path is aliased
import { LayoutGrid } from './layout/LayoutGrid';
import { Grid2DContainer } from './layout/Grid2DContainer';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop'; // Ensure this hook handles string IDs
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react'; // Added Plus icon
import { Button } from '@/components/ui/button'; // Added Button

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down' | number) => void; // Updated to include number for general move
  onAddBlock: (type: BlockType, position?: number) => string; // Ensure this returns string ID
  onDuplicateBlock: (blockId: string) => void;
  onConvertToGrid: (blockId: string, columns: number) => void;
  onConvertTo2DGrid: (blockId: string, columns: number, rows: number) => void;
  onMergeBlockIntoGrid: (draggedBlockId: string, targetRowId: string, targetPosition?: number) => void;
  onPlaceBlockIn2DGrid: (blockId: string, gridId: string, position: GridPosition) => void;
  className?: string;
  readonly?: boolean;
}

// Helper to determine if a block is a layout type
const isLayoutBlock = (block: ReviewBlock): boolean => {
  return block.type === 'layout_grid' || block.type === 'grid_2d'; // Assuming 'layout_grid' for 1D and 'grid_2d' for 2D
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
  // ... keep existing code (useState for dragState, lastDropTarget, etc.)
  const [dragState, setDragState] = useState<{
    draggedBlockId: string | null;
    dragOverBlockId: string | null; // For dropping onto another block (e.g. merge)
    dragOverPosition: 'before' | 'after' | 'over' | null; // 'over' for dropping onto a block
    isDragging: boolean;
    draggedFromType: 'list' | 'grid' | null; // To know if it came from BlockList or a Grid cell
    dropTargetType: 'list' | 'grid-cell' | 'grid-row' | null; // What kind of target it's over
  }>({
    draggedBlockId: null,
    dragOverBlockId: null,
    dragOverPosition: null,
    isDragging: false,
    draggedFromType: null,
    dropTargetType: null,
  });
  const [lastDropTarget, setLastDropTarget] = useState<{ blockId: string; position: 'before' | 'after' | 'over' } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle drag start from BlockList (individual blocks)
  const handleBlockDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    // ... keep existing code
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId); // Standard way to set data
    setDragState({
      draggedBlockId: blockId,
      dragOverBlockId: null,
      dragOverPosition: null,
      isDragging: true,
      draggedFromType: 'list', // Assuming it's from BlockList initially
      dropTargetType: null,
    });
  }, []);

  // Handle drag over an insert line (between blocks in BlockList)
  const handleInsertLineDragOver = useCallback((e: React.DragEvent, position: 'before' | 'after', targetBlockId?: string) => {
    // ... keep existing code
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.draggedBlockId && dragState.draggedBlockId !== targetBlockId) {
      setDragState(prev => ({ ...prev, dragOverBlockId: targetBlockId || null, dragOverPosition: position, dropTargetType: 'list' }));
      if (targetBlockId) {
        setLastDropTarget({ blockId: targetBlockId, position });
      } else if (position === 'before' && blocks.length > 0) { // Dropping at the very start
        setLastDropTarget({ blockId: blocks[0].id, position: 'before' });
      } else if (position === 'after' && blocks.length > 0) { // Dropping at the very end
        setLastDropTarget({ blockId: blocks[blocks.length - 1].id, position: 'after' });
      } else if (blocks.length === 0) { // Dropping into empty list
         setLastDropTarget({ blockId: 'empty-list-target', position: 'before'}); // Special placeholder
      }
    }
  }, [dragState.draggedBlockId, blocks]);

  // Handle drag over a block itself (for merging or reordering within layouts)
  const handleBlockDragOver = useCallback((e: React.DragEvent, targetBlockId: string) => {
    // ... keep existing code
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move'; // Or 'copy' if duplicating
    // Determine if it's over top/bottom half for before/after, or center for 'over' (merge)
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    let position: 'before' | 'after' | 'over' = 'over'; // Default to 'over' for merge
    if (y < rect.height / 3) position = 'before';
    else if (y > (rect.height * 2) / 3) position = 'after';
    
    if (dragState.draggedBlockId && dragState.draggedBlockId !== targetBlockId) {
      setDragState(prev => ({ ...prev, dragOverBlockId: targetBlockId, dragOverPosition: position, dropTargetType: 'list' })); // Assuming drop to list for now
      setLastDropTarget({ blockId: targetBlockId, position });
    }
  }, [dragState.draggedBlockId]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // ... keep existing code
    // Clear dragOver state if leaving a potential drop target
    // This needs to be carefully managed to avoid flickering
    const relatedTarget = e.relatedTarget as Node;
    if (editorRef.current && !editorRef.current.contains(relatedTarget)) {
        setDragState(prev => ({ ...prev, dragOverBlockId: null, dragOverPosition: null, dropTargetType: null }));
        setLastDropTarget(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    // ... keep existing code
    e.preventDefault();
    const draggedBlockId = e.dataTransfer.getData('text/plain');
    if (!draggedBlockId || !lastDropTarget) {
      setDragState({ draggedBlockId: null, dragOverBlockId: null, dragOverPosition: null, isDragging: false, draggedFromType: null, dropTargetType: null });
      return;
    }

    const { blockId: targetBlockId, position: dropPosition } = lastDropTarget;
    const targetIndex = blocks.findIndex(b => b.id === targetBlockId);

    if (draggedBlockId === targetBlockId && dropPosition !== 'over') { // Trying to drop on itself but not merge
        setDragState({ draggedBlockId: null, dragOverBlockId: null, dragOverPosition: null, isDragging: false, draggedFromType: null, dropTargetType: null });
        return;
    }
    
    // Handle dropping onto an existing block (e.g., for merging or converting to grid)
    if (dropPosition === 'over' && targetBlockId && targetBlockId !== 'empty-list-target') {
        const targetBlock = blocks.find(b => b.id === targetBlockId);
        // Example: Merge into grid (if target is a grid row/cell, this would be handled by Grid components)
        // For BlockEditor, maybe it means convert target to grid and add dragged block
        if (targetBlock && !isLayoutBlock(targetBlock) && !isLayoutBlock(blocks.find(b => b.id === draggedBlockId)!)) {
            // Example: onMergeBlockIntoGrid might be relevant if target was part of a grid
            // Or, convert target to a 2-column grid and place both blocks
            // This logic needs to be more specific based on requirements.
            // For now, let's treat 'over' like 'after' if not merging into a grid directly.
             if (targetIndex !== -1) {
                onMoveBlock(draggedBlockId, targetIndex + (targetBlockId === draggedBlockId ? 0 : 1));
             }
        } else {
          // If target is a layout or dragged is a layout, defer to specific layout handlers or reorder
           if (targetIndex !== -1) {
             onMoveBlock(draggedBlockId, targetIndex + 1);
           }
        }
    } else if (targetBlockId === 'empty-list-target') { // Dropping into an empty list
        onMoveBlock(draggedBlockId, 0);
    }
    // Handle dropping between blocks (reordering) or at start/end
    else if (targetIndex !== -1) {
      if (dropPosition === 'before') {
        onMoveBlock(draggedBlockId, targetIndex);
      } else if (dropPosition === 'after') {
        onMoveBlock(draggedBlockId, targetIndex + 1);
      }
    } else if (blocks.length > 0 && dropPosition === 'before') { // targetBlockId might be the first block
        onMoveBlock(draggedBlockId, 0);
    } else if (blocks.length > 0 && dropPosition === 'after') { // targetBlockId might be the last block
        onMoveBlock(draggedBlockId, blocks.length);
    }


    setDragState({ draggedBlockId: null, dragOverBlockId: null, dragOverPosition: null, isDragging: false, draggedFromType: null, dropTargetType: null });
    setLastDropTarget(null);
  }, [blocks, onMoveBlock, lastDropTarget, onMergeBlockIntoGrid]);

  const handleDragEnd = useCallback(() => {
    // ... keep existing code
    // Reset drag state regardless of drop success
    setDragState({
      draggedBlockId: null,
      dragOverBlockId: null,
      dragOverPosition: null,
      isDragging: false,
      draggedFromType: null,
      dropTargetType: null,
    });
    setLastDropTarget(null);
  }, []);

  const handleAddBlockToList = useCallback((type: BlockType, index?: number) => {
    onAddBlock(type, index);
  }, [onAddBlock]);

  // ... keep existing code (renderLayoutGrid, renderGrid2DContainer)
  const renderLayoutGrid = (block: ReviewBlock) => {
    if (block.type !== 'layout_grid' || !block.content?.rows) {
      console.warn('renderLayoutGrid called with invalid block:', block);
      return null;
    }
    // Ensure content.rows is correctly typed as LayoutRowData[]
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
          onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
        }}
        onAddRow={(position, columns = 1) => {
          // ... implementation to add a new row to block.content.rows
          const newRowId = `row-${Date.now()}`;
          const newRow: LayoutRowData = { id: newRowId, blocks: [], columns, columnWidths: Array(columns).fill(100/columns) };
          const insertAt = position !== undefined ? position : layoutRows.length;
          const updatedRows = [...layoutRows.slice(0, insertAt), newRow, ...layoutRows.slice(insertAt)];
          onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
        }}
        onAddBlock={(rowId, blockPosition, blockType) => {
          // Find the row, add the new block (created via onAddBlock), then update the row's blocks array
          const newBlockId = onAddBlock(blockType as BlockType); // Get the new block's ID
          const newBlock = blocks.find(b => b.id === newBlockId); // Find the newly created block
          
          if (!newBlock) return;

          const updatedRows = layoutRows.map(r => {
            if (r.id === rowId) {
              const updatedRowBlocks = [...r.blocks.slice(0, blockPosition), newBlock, ...r.blocks.slice(blockPosition)];
              return { ...r, blocks: updatedRowBlocks };
            }
            return r;
          });
          onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
          // The new block is already in the main `blocks` array from `onAddBlock`.
          // We might need to remove it from the top-level `blocks` if it's now *only* in a grid.
          // This depends on how useBlockManagement handles blocks within grids.
          // For now, assume it's okay for it to be in both, or that parent `onAddBlock` handles this.
        }}
        onUpdateBlock={onUpdateBlock} // Pass down for blocks within the grid
        onMoveBlock={(movedBlockId, targetRowId, targetPosition) => {
            // Complex: involves removing from source row, adding to target row, updating main blocks array order
            console.log('Move block within LayoutGrid:', { movedBlockId, targetRowId, targetPosition });
            // This would likely involve onUpdateBlock for multiple rows and potentially onMoveBlock for global order
        }}
        onDeleteBlock={(blockIdToDelete) => {
            // Remove block from its row, then call global onDeleteBlock
             const updatedRows = layoutRows.map(r => ({
                ...r,
                blocks: r.blocks.filter(b => b.id !== blockIdToDelete)
            }));
            onUpdateBlock(block.id, { content: { ...block.content, rows: updatedRows } });
            onDeleteBlock(blockIdToDelete); // Also delete from main list if it exists there
        }}
        readonly={readonly}
        // activeBlockId={activeBlockId} // Pass if LayoutGrid needs it
        // onActiveBlockChange={onActiveBlockChange} // Pass if LayoutGrid needs it
      />
    );
  };

  const renderGrid2DContainer = (block: ReviewBlock) => {
    if (block.type !== 'grid_2d' || !block.content) {
      console.warn('renderGrid2DContainer called with invalid block:', block);
      return null;
    }
    // Ensure block.content is correctly typed as Grid2DLayout
    const gridLayout = block.content as Grid2DLayout;

    return (
      <Grid2DContainer
        key={block.id}
        gridId={block.id} // The block's ID is the grid's ID
        initialLayout={gridLayout} // Pass the Grid2DLayout content
        activeBlockId={activeBlockId}
        onActiveBlockChange={onActiveBlockChange}
        onUpdateBlock={(childBlockId, updates) => {
          // This updates a block *within* the 2D grid.
          // The global onUpdateBlock should be called.
          onUpdateBlock(childBlockId, updates);
          // Additionally, the Grid2DContainer might need to update its own layout if block metadata changes size/position
          // This requires `onUpdateLayout` prop in Grid2DContainer
        }}
        onDeleteBlock={(childBlockId) => {
          // This deletes a block *within* the 2D grid.
          // The global onDeleteBlock should be called.
          onDeleteBlock(childBlockId);
          // Grid2DContainer needs to update its layout
        }}
        onAddBlock={(gridId, position) => { // gridId here is block.id
          // Adding a block to a specific cell in the 2D grid
          const newBlockId = onAddBlock('paragraph', undefined); // Add to end of main list, then place
          onPlaceBlockIn2DGrid(newBlockId, gridId, position);
        }}
        onLayoutChange={(newLayout) => {
          onUpdateBlock(block.id, { content: newLayout });
        }}
        // ... any other necessary props for Grid2DContainer
        readonly={readonly}
      />
    );
  };

  const DEFAULT_BLOCK_TYPE: BlockType = 'paragraph';

  return (
    <div 
      ref={editorRef}
      className={cn("block-editor relative p-2 space-y-1 overflow-y-auto h-full flex-grow", className)}
      onDragOver={(e) => e.preventDefault()} // Allow dropping anywhere in the editor for general reordering
      onDrop={handleDrop}
      onDragLeave={handleDragLeave} // To reset dragOver state when leaving editor area
    >
      {blocks.length === 0 && !readonly && (
        // ... keep existing code (empty state JSX for adding first block)
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-center p-6 border-2 border-dashed border-gray-700 rounded-lg">
            <Plus className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-300 mb-1">Editor Vazio</h3>
            <p className="mb-3 text-sm">Arraste blocos da paleta ou clique abaixo para adicionar.</p>
            <Button onClick={() => handleAddBlockToList(DEFAULT_BLOCK_TYPE, 0)} variant="outline">
              Adicionar Primeiro Bloco
            </Button>
          </div>
        </div>
      )}

      {/* Insertion point at the very top */}
      {blocks.length > 0 && !readonly && (
          <div 
            className="insert-line h-2 my-0.5 w-full transition-all duration-150 rounded"
            onDragOver={(e) => handleInsertLineDragOver(e, 'before', blocks[0].id)}
            onDrop={handleDrop} // Drop handled by main editor for reordering
            style={{ 
              backgroundColor: dragState.dragOverBlockId === blocks[0].id && dragState.dragOverPosition === 'before' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              height: dragState.dragOverBlockId === blocks[0].id && dragState.dragOverPosition === 'before' ? '30px' : '0.5rem',
            }}
          >
            { (dragState.dragOverBlockId === blocks[0].id && dragState.dragOverPosition === 'before') && <div className="h-full w-full bg-blue-500 opacity-50 rounded"></div>}
          </div>
      )}

      {blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          {isLayoutBlock(block) ? (
            block.type === 'layout_grid' ? renderLayoutGrid(block) : renderGrid2DContainer(block)
          ) : (
            <div 
              className="block-wrapper"
              onDragOver={(e) => handleBlockDragOver(e, block.id)} // For dropping onto this block
              // onDrop here would be specific to merging/replacing this block
            >
              <SingleBlock
                block={block}
                activeBlockId={activeBlockId!}
                dragState={{ isDragging: dragState.draggedBlockId === block.id, dragOverPosition: dragState.dragOverBlockId === block.id ? dragState.dragOverPosition : null }}
                onActiveBlockChange={() => onActiveBlockChange(block.id)}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                onAddBlock={(type, relativePosition) => { // relativePosition is 'before' | 'after' block
                  const position = relativePosition === 'before' ? index : index + 1;
                  onAddBlock(type, position);
                }}
                onDuplicateBlock={onDuplicateBlock}
                onConvertToGrid={onConvertToGrid}
                onConvertTo2DGrid={onConvertTo2DGrid}
                onDragStart={(e) => handleBlockDragStart(e, block.id)}
                onDragEnd={handleDragEnd}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
                onMoveBlock={(direction) => { // 'up' or 'down' from SingleBlock controls
                    if (direction === 'up') onMoveBlock(block.id, index -1);
                    if (direction === 'down') onMoveBlock(block.id, index + 1);
                }}
                readonly={readonly}
              />
            </div>
          )}
          {!readonly && (
            <div 
                className="insert-line h-2 my-0.5 w-full transition-all duration-150 rounded"
                onDragOver={(e) => handleInsertLineDragOver(e, 'after', block.id)}
                onDrop={handleDrop} // Drop handled by main editor for reordering
                style={{ 
                backgroundColor: dragState.dragOverBlockId === block.id && dragState.dragOverPosition === 'after' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                height: dragState.dragOverBlockId === block.id && dragState.dragOverPosition === 'after' ? '30px' : '0.5rem',
                }}
            >
                { (dragState.dragOverBlockId === block.id && dragState.dragOverPosition === 'after') && <div className="h-full w-full bg-blue-500 opacity-50 rounded"></div>}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
