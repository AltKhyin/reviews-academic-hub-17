
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
  Columns4
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

  // FIXED: Enhanced grid conversion with proper validation
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
    } else {
      console.error('onConvertToGrid handler not provided');
    }
  }, [blocks, onConvertToGrid, isBlockInGrid]);

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

    // Add visual feedback class to body
    document.body.classList.add('dragging-block');
  }, [getRowByBlockId]);

  // FIXED: Debounced drag over handling
  const handleDragOver = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    // Debounce the drag over state updates
    dragTimeoutRef.current = setTimeout(() => {
      if (dragState.isDragging && !processingDropRef.current) {
        setDragState(prev => ({
          ...prev,
          dragOverRowId: targetRowId,
          dragOverPosition: targetPosition ?? null,
          dropTargetType: targetType || 'single'
        }));
      }
    }, 50);
  }, [dragState.isDragging]);

  // FIXED: Improved drag leave handling
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger if leaving the actual drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      
      dragTimeoutRef.current = setTimeout(() => {
        if (!processingDropRef.current) {
          setDragState(prev => ({
            ...prev,
            dragOverRowId: null,
            dragOverPosition: null,
            dropTargetType: null
          }));
        }
      }, 100);
    }
  }, []);

  // FIXED: Enhanced drop handler with proper merge functionality and state management
  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple concurrent drops
    if (processingDropRef.current || !dragState.draggedBlockId) {
      console.warn('Drop ignored - already processing or no dragged block');
      return;
    }

    processingDropRef.current = true;
    
    try {
      const draggedBlock = blocks.find(b => b.id === dragState.draggedBlockId);
      const targetRow = layoutState.rows.find(r => r.id === targetRowId);
      
      if (!draggedBlock || !targetRow) {
        console.error('Invalid drop operation:', { 
          draggedBlock: !!draggedBlock, 
          targetRow: !!targetRow,
          targetRowId 
        });
        return;
      }

      console.log('Executing drop operation:', { 
        blockId: dragState.draggedBlockId, 
        targetRowId, 
        targetPosition,
        dropType,
        targetRowColumns: targetRow.columns,
        sourceRowId: dragState.draggedFromRowId
      });

      // Clear drag state immediately to prevent visual glitches
      setDragState({
        draggedBlockId: null,
        dragOverRowId: null,
        dragOverPosition: null,
        isDragging: false,
        draggedFromRowId: null,
        dropTargetType: null
      });

      // Clear active block to reset visual state
      onActiveBlockChange(null);

      // FIXED: Enhanced merge logic using the improved merge function
      if ((dropType === 'merge' || targetRow.columns > 1) && onMergeBlockIntoGrid) {
        console.log('Merging block into grid using dedicated function');
        setTimeout(() => {
          onMergeBlockIntoGrid!(dragState.draggedBlockId!, targetRowId, targetPosition);
        }, 50);
      } else {
        // STANDARD DROP: Move to position in single row
        const finalPosition = targetPosition ?? targetRow.blocks.length;
        
        setTimeout(() => {
          onUpdateBlock(dragState.draggedBlockId!, {
            meta: {
              ...draggedBlock.meta,
              layout: targetRow.columns > 1 ? {
                row_id: targetRowId,
                position: finalPosition,
                columns: targetRow.columns,
                gap: targetRow.gap || 4,
                columnWidths: targetRow.columnWidths
              } : undefined
            }
          });
        }, 50);
      }

    } finally {
      // Reset processing flag after a delay
      setTimeout(() => {
        processingDropRef.current = false;
      }, 200);
    }
  }, [dragState, blocks, layoutState.rows, onUpdateBlock, onMergeBlockIntoGrid, onActiveBlockChange]);

  // FIXED: Proper drag end cleanup
  const handleDragEnd = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Remove visual feedback class
    document.body.classList.remove('dragging-block');
    
    // Reset drag state after a small delay to prevent conflicts
    setTimeout(() => {
      setDragState({
        draggedBlockId: null,
        dragOverRowId: null,
        dragOverPosition: null,
        isDragging: false,
        draggedFromRowId: null,
        dropTargetType: null
      });
    }, 100);
  }, []);

  // FIXED: Enhanced block rendering with proper event handling
  const renderBlock = (block: ReviewBlock, rowIndex: number, blockIndex: number, row: any) => {
    const globalIndex = blocks.findIndex(b => b.id === block.id);
    const isActive = activeBlockId === block.id;
    const isDragging = dragState.draggedBlockId === block.id;
    const isDropTarget = dragState.dragOverRowId === row.id && dragState.dragOverPosition === blockIndex;
    const isMergeTarget = dragState.dropTargetType === 'merge' && dragState.dragOverRowId === row.id;

    return (
      <div key={block.id} className="relative">
        {/* Drop zone indicator */}
        {isDropTarget && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded z-20 animate-pulse" />
        )}
        
        {/* Merge zone indicator */}
        {isMergeTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-10 animate-pulse bg-green-500/10">
            <div className="absolute top-2 left-2 text-xs text-green-400 font-medium">
              Soltar para adicionar ao grid
            </div>
          </div>
        )}
        
        <div className="relative group">
          {/* Add block button - appears on hover */}
          <div className="flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addBlockBetween(globalIndex);
              }}
              className="h-6 w-24 text-xs"
              style={{ color: '#9ca3af' }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          <Card
            className={cn(
              "relative transition-all duration-200 cursor-pointer",
              isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
              !block.visible && "opacity-50",
              isDragging && "opacity-30 scale-95"
            )}
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: isActive ? '#3b82f6' : '#2a2a2a'
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={(e) => {
              const dropType = row.columns > 1 ? 'merge' : 
                             dragState.draggedBlockId && dragState.draggedBlockId !== block.id ? 'merge' : 'single';
              handleDragOver(e, row.id, blockIndex, dropType);
            }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              const dropType = row.columns > 1 ? 'merge' : 
                             dragState.draggedBlockId && dragState.draggedBlockId !== block.id ? 'merge' : 'single';
              handleDrop(e, row.id, blockIndex, dropType);
            }}
            onDragEnd={handleDragEnd}
          >
            {/* FIXED: Block Controls with proper event handling */}
            <div className={cn(
              "absolute -top-2 -right-2 flex items-center gap-1 z-10 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {/* Grid conversion buttons - only for single blocks */}
              {row.columns === 1 && !isBlockInGrid(block.id) && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => convertToLayout(block.id, 2, e)}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                    title="2 colunas"
                  >
                    <Columns2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => convertToLayout(block.id, 3, e)}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                    title="3 colunas"
                  >
                    <Columns3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => convertToLayout(block.id, 4, e)}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                    title="4 colunas"
                  >
                    <Columns4 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleBlockVisibilityToggle(block.id, e)}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
              >
                {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              
              {/* Duplicate button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDuplicateBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
                title="Duplicar bloco"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  deleteBlockWithLayoutRepair(block.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {/* Drag handle for single blocks */}
            {row.columns === 1 && (
              <div className={cn(
                "absolute -left-2 top-1/2 transform -translate-y-1/2 transition-opacity",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <DragHandle 
                  onMoveUp={() => onMoveBlock(block.id, 'up')}
                  onMoveDown={() => onMoveBlock(block.id, 'down')}
                  canMoveUp={globalIndex > 0}
                  canMoveDown={globalIndex < blocks.length - 1}
                />
              </div>
            )}

            {/* Block Content */}
            <div className="p-4">
              <BlockRenderer
                block={block}
                onUpdate={onUpdateBlock}
                readonly={false}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("block-editor flex-1 overflow-y-auto p-4", className)} style={{ backgroundColor: '#121212' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {layoutState.rows.map((row, rowIndex) => {
          if (row.columns > 1) {
            // Grid layout
            return (
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
            );
          } else {
            // Single block layout
            return row.blocks.map((block, blockIndex) => 
              renderBlock(block, rowIndex, blockIndex, row)
            );
          }
        })}

        {/* Add first block if no blocks exist */}
        {blocks.length === 0 && (
          <div className="text-center py-12">
            <Button
              variant="ghost"
              onClick={() => addBlockBetween(0)}
              className="text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Bloco
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
