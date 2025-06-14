
// ABOUTME: Enhanced block editor with complete 2D grid support and dynamic layout
// Main editor with full grid functionality and responsive design - UPDATED: Reduced spacing by 50%

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

interface DragState {
  draggedBlockId: string | null;
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

    const processedBlockIds = new Set<string>();

    // First, handle 2D grids
    const grid2DIds = new Set<string>();
    blocks.forEach(block => {
      const gridId = block.meta?.layout?.grid_id;
      if (gridId && !grid2DIds.has(gridId)) {
        grid2DIds.add(gridId);
        const gridBlocks = blocks.filter(b => b.meta?.layout?.grid_id === gridId);
        
        // Validate that blocks have valid grid positions
        const validGridBlocks = gridBlocks.filter(b => {
          const pos = b.meta?.layout?.grid_position;
          return pos && (typeof pos === 'object' && typeof pos.row === 'number' && typeof pos.column === 'number');
        });
        
        if (validGridBlocks.length > 0) {
          validGridBlocks.forEach(b => processedBlockIds.add(b.id));
          
          groups.push({
            type: '2d-grid',
            id: gridId,
            blocks: validGridBlocks,
            config: validGridBlocks[0]?.meta?.layout
          });
        }
      }
    });

    // Then handle 1D grids
    const rowIds = new Set<string>();
    blocks.forEach(block => {
      const rowId = block.meta?.layout?.row_id;
      if (rowId && !rowIds.has(rowId) && !processedBlockIds.has(block.id)) {
        rowIds.add(rowId);
        const rowBlocks = blocks.filter(b => 
          b.meta?.layout?.row_id === rowId && !processedBlockIds.has(b.id)
        );
        
        if (rowBlocks.length > 0) {
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
    return onAddBlock(type, position);
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

    return onAddBlock('paragraph' as BlockType, insertionIndex);
  }, [layoutState.rows, blocks, onAddBlock]);

  // 2D Grid operations - FIXED: Proper block creation and placement
  const handleAddBlockTo2DGrid = useCallback((gridId: string, position: GridPosition) => {
    console.log('Adding block to 2D grid:', { gridId, position });
    
    // Create a new block first
    const newBlockId = onAddBlock('paragraph' as BlockType, blocks.length);
    
    // Place it in the 2D grid immediately using the returned block ID
    if (onPlaceBlockIn2DGrid && newBlockId) {
      console.log('Placing newly created block in 2D grid:', { newBlockId, gridId, position });
      onPlaceBlockIn2DGrid(newBlockId, gridId, position);
    } else {
      console.error('Failed to place block in 2D grid:', { newBlockId, onPlaceBlockIn2DGrid });
    }
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
  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    if (processingDropRef.current) {
      e.preventDefault();
      return;
    }
    
    const sourceRow = getRowByBlockId(blockId);
    const sourceGrid = blocks.find(b => b.id === blockId)?.meta?.layout?.grid_id;
    
    setDragState({
      draggedBlockId: blockId,
      draggedFromRowId: sourceRow?.id || sourceGrid || null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: true,
      dropTargetType: null
    });

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
    e.dataTransfer.setData('application/json', JSON.stringify({
      blockId,
      sourceRowId: sourceRow?.id || null,
      sourceGridId: sourceGrid || null
    }));

    document.body.classList.add('dragging');
  }, [getRowByBlockId, blocks]);

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

  // Handle drop for both 1D and 2D grids - FIXED: Proper 2D grid integration
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
        // Find the grid configuration to convert linear position to grid position
        const gridBlocks = blocks.filter(b => b.meta?.layout?.grid_id === targetRowId);
        const columns = gridBlocks[0]?.meta?.layout?.columns || 2;
        const gridPosition: GridPosition = {
          row: Math.floor(targetPosition / columns),
          column: targetPosition % columns
        };
        
        console.log('Placing block in 2D grid:', { 
          blockId: dragState.draggedBlockId, 
          gridId: targetRowId, 
          position: gridPosition 
        });
        
        onPlaceBlockIn2DGrid(dragState.draggedBlockId, targetRowId, gridPosition);
      } 
      // Handle 1D grid drops
      else if (onMergeBlockIntoGrid) {
        console.log('Merging block into 1D grid:', { 
          blockId: dragState.draggedBlockId, 
          targetRowId, 
          targetPosition 
        });
        
        onMergeBlockIntoGrid(dragState.draggedBlockId, targetRowId, targetPosition);
      }
    } catch (error) {
      console.error('Drop operation failed:', error);
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
      className={cn("block-editor py-3 overflow-hidden w-full max-w-full", className)}
      style={{
        backgroundColor: '#121212',
        color: '#ffffff',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
    >
      {/* Dynamic width indicator for Dividir mode */}
      {isDividirMode && (
        <div className="mb-2 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-gray-900/20 border border-gray-600/30 rounded-full text-gray-400 text-sm">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></span>
            Modo Dividir Ativo • Editor Expandido
          </div>
        </div>
      )}

      {/* Render layout groups in order */}
      <div className="w-full max-w-full overflow-hidden">
        {layoutGroups.map((group, groupIndex) => {
          const globalIndex = group.blocks.length > 0 ? 
            blocks.findIndex(b => b.id === group.blocks[0].id) : 0;

          if (group.type === '2d-grid') {
            // Find the grid from extracted grids
            const grid = grids.find(g => g.id === group.id);
            if (grid) {
              return (
                <div key={group.id} className="mx-2 mb-4 w-full max-w-full overflow-hidden">
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
                    onDragOver={() => {}}
                    onDragLeave={() => {}}
                    onDrop={() => {}}
                  />
                </div>
              );
            } else {
              console.warn('Grid not found for group:', group.id);
              return null;
            }
          } else if (group.type === '1d-grid') {
            return (
              <div key={group.id} className="mx-2 mb-3 w-full max-w-full overflow-hidden">
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
                  onDragOver={() => {}}
                  onDragLeave={() => {}}
                  onDrop={() => {}}
                />
              </div>
            );
          } else {
            // Single block
            const block = group.blocks[0];
            return (
              <div key={block.id} className="w-full max-w-full overflow-hidden">
                <SingleBlock
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
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                  onDragOver={() => {}}
                  onDragLeave={() => {}}
                  onDrop={() => {}}
                />
              </div>
            );
          }
        })}
      </div>

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
          Adicionar Bloco
        </Button>
      </div>
    </div>
  );
};
