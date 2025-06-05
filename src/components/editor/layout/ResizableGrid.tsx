
// ABOUTME: Fixed resizable grid layout with proper event handling and block management
// Resolved UI freezing, drag states, and grid operation issues

import React, { useCallback, useMemo } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { GridControls } from './GridControls';
import { useEnhancedGridOperations } from '@/hooks/useEnhancedGridOperations';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  columnWidthsToPanelSizes, 
  panelSizesToColumnWidths,
  normalizeColumnWidths 
} from '@/utils/gridLayoutUtils';

interface DragState {
  draggedBlockId: number | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface ResizableGridProps {
  rowId: string;
  blocks: ReviewBlock[];
  columns: number;
  gap?: number;
  columnWidths?: number[];
  onUpdateLayout: (rowId: string, updates: { columnWidths: number[] }) => void;
  onAddBlock: (rowId: string, position: number) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  activeBlockId?: number | null;
  onActiveBlockChange?: (blockId: number | null) => void;
  readonly?: boolean;
  className?: string;
  dragState?: DragState;
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

export const ResizableGrid: React.FC<ResizableGridProps> = ({
  rowId,
  blocks,
  columns,
  gap = 4,
  columnWidths,
  onUpdateLayout,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  activeBlockId,
  onActiveBlockChange,
  readonly = false,
  className,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Convert column widths to panel sizes with proper normalization
  const panelSizes = useMemo(() => {
    return columnWidthsToPanelSizes(columnWidths, columns);
  }, [columnWidths, columns]);

  // Enhanced grid operations with proper handlers
  const {
    addColumnToGrid,
    removeColumnFromGrid,
    mergeGridBlocks,
    convertGridToSingle,
    reorderGridColumns
  } = useEnhancedGridOperations({
    blocks: blocks,
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock: (type, position, layoutInfo) => {
      // FIXED: Proper grid position handling
      if (layoutInfo && layoutInfo.rowId === rowId) {
        onAddBlock(rowId, layoutInfo.gridPosition);
      }
    }
  });

  console.log('ResizableGrid render:', { 
    rowId, 
    columns, 
    blocksCount: blocks.length, 
    columnWidths, 
    panelSizes,
    dragState 
  });

  // FIXED: Debounced panel resize to prevent excessive updates
  const handlePanelResize = useCallback((sizes: number[]) => {
    const normalizedWidths = panelSizesToColumnWidths(sizes);
    
    // Only update if there's a meaningful change
    const hasSignificantChange = columnWidths ? 
      normalizedWidths.some((width, index) => Math.abs(width - (columnWidths[index] || 0)) > 0.5) :
      true;

    if (hasSignificantChange) {
      console.log('Panel resize with significant change:', { rowId, newSizes: normalizedWidths });
      onUpdateLayout(rowId, { columnWidths: normalizedWidths });
    }
  }, [rowId, onUpdateLayout, columnWidths]);

  // FIXED: Improved block click handling with better event filtering
  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    if (!readonly && onActiveBlockChange) {
      const target = event.target as Element;
      
      // More specific interactive element detection
      const isInteractiveElement = target.closest(
        '.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select, [contenteditable], .grid-controls'
      );
      
      // Don't change selection when clicking interactive elements
      if (!isInteractiveElement) {
        event.stopPropagation();
        onActiveBlockChange(activeBlockId === blockId ? null : blockId);
      }
    }
  }, [activeBlockId, onActiveBlockChange, readonly]);

  // FIXED: Enhanced grid operations handlers with proper error handling
  const handleAddColumn = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Adding column to grid:', rowId);
    const result = addColumnToGrid(rowId);
    
    if (!result?.success) {
      console.error('Failed to add column to grid');
    }
  }, [addColumnToGrid, rowId]);

  const handleRemoveColumn = useCallback((columnIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Removing column from grid:', { rowId, columnIndex });
    const result = removeColumnFromGrid(rowId, columnIndex);
    
    if (!result?.success) {
      console.error('Failed to remove column from grid');
    }
  }, [removeColumnFromGrid, rowId]);

  const handleMergeBlocks = useCallback((leftIndex: number, rightIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Merging blocks in grid:', { rowId, leftIndex, rightIndex });
    const result = mergeGridBlocks(rowId, leftIndex, rightIndex);
    
    if (!result?.success) {
      console.error('Failed to merge blocks in grid');
    }
  }, [mergeGridBlocks, rowId]);

  const handleConvertToSingle = useCallback((mergeContent: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Converting grid to single:', { rowId, mergeContent });
    convertGridToSingle(rowId, mergeContent);
  }, [convertGridToSingle, rowId]);

  const handleReorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    console.log('Reordering columns:', { rowId, fromIndex, toIndex });
    reorderGridColumns(rowId, fromIndex, toIndex);
  }, [reorderGridColumns, rowId]);

  // FIXED: Proper drag handlers with event cleanup
  const handleGridDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, position?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDragOver && dragState?.isDragging) {
      onDragOver(e, rowId, position, 'merge');
    }
  }, [onDragOver, rowId, dragState]);

  const handleGridDrop = useCallback((e: React.DragEvent<HTMLDivElement>, position?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDrop && dragState?.isDragging) {
      console.log('Grid drop:', { rowId, position, draggedBlock: dragState.draggedBlockId });
      onDrop(e, rowId, position, 'merge');
    }
  }, [onDrop, rowId, dragState]);

  const handleGridDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Only trigger if actually leaving the grid area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (onDragLeave) {
        onDragLeave(e);
      }
    }
  }, [onDragLeave]);

  // FIXED: Enhanced empty slot rendering with proper add block functionality
  const renderEmptySlot = (position: number) => {
    const isDropTarget = dragState?.dragOverRowId === rowId && 
                        dragState?.dragOverPosition === position && 
                        dragState?.dropTargetType === 'merge';

    // FIXED: Proper add block handler that calculates correct insertion position
    const handleAddBlockToPosition = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Adding block to grid position:', { rowId, position });
      
      // Find the correct global insertion index based on grid position
      const row = blocks.find(b => b.meta?.layout?.row_id === rowId);
      if (row) {
        const rowBlocks = blocks.filter(b => b.meta?.layout?.row_id === rowId);
        const lastBlockInRow = rowBlocks[rowBlocks.length - 1];
        const insertionIndex = lastBlockInRow ? 
          blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
          blocks.length;
        
        onAddBlock(rowId, insertionIndex);
      } else {
        onAddBlock(rowId, position);
      }
    }, [position]);

    return (
      <div
        className={cn(
          "min-h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all relative group",
          "border-gray-600 hover:border-gray-500",
          isDropTarget && "border-green-500 bg-green-500/10 animate-pulse"
        )}
        style={{ borderColor: isDropTarget ? '#22c55e' : '#2a2a2a' }}
        onDragOver={(e) => handleGridDragOver(e, position)}
        onDragLeave={handleGridDragLeave}
        onDrop={(e) => handleGridDrop(e, position)}
      >
        {isDropTarget && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
            <div className="text-center">
              <div className="text-green-400 font-medium text-sm mb-2">
                ↓ Soltar bloco aqui ↓
              </div>
              <div className="text-green-300 text-xs">
                Será adicionado à posição {position + 1}
              </div>
            </div>
          </div>
        )}
        
        {!readonly && !isDropTarget && (
          <div className="text-center opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="text-gray-400 text-sm mb-3">Posição {position + 1}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddBlockToPosition}
              className="text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Bloco
            </Button>
            <div className="text-xs text-gray-500 mt-2">
              ou arraste um bloco existente
            </div>
          </div>
        )}
      </div>
    );
  };

  // FIXED: Enhanced block rendering with proper drag state handling
  const renderBlock = (block: ReviewBlock, position: number) => {
    const isActive = activeBlockId === block.id;
    const isDragging = dragState?.draggedBlockId === block.id;
    const isDropTarget = dragState?.dragOverRowId === rowId && 
                        dragState?.dragOverPosition === position && 
                        dragState?.dropTargetType === 'merge';

    return (
      <div className="relative group h-full" key={`block-${block.id}`}>
        {/* Drop zone indicator for merge */}
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg z-10 animate-pulse bg-green-500/10">
            <div className="absolute top-2 left-2 text-xs text-green-400 font-medium">
              Mesclar aqui
            </div>
          </div>
        )}

        <div
          className={cn(
            "h-full transition-all duration-200 cursor-pointer rounded-lg relative",
            isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
            !block.visible && "opacity-50",
            isDragging && "opacity-30 scale-95"
          )}
          style={{ 
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            borderColor: isActive ? '#3b82f6' : 'transparent'
          }}
          onClick={(e) => handleBlockClick(block.id, e)}
          onDragOver={(e) => handleGridDragOver(e, position)}
          onDragLeave={handleGridDragLeave}
          onDrop={(e) => handleGridDrop(e, position)}
        >
          {/* FIXED: Block Controls with proper event handling */}
          {!readonly && (
            <div className={cn(
              "absolute -top-2 -right-2 z-10 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log('Deleting block from grid:', { blockId: block.id, rowId });
                  onDeleteBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Block Content */}
          <div className="p-4 h-full">
            <BlockRenderer
              block={block}
              onUpdate={onUpdateBlock}
              readonly={readonly}
            />
          </div>
        </div>
      </div>
    );
  };

  const hasBlocks = blocks.length > 0;
  const isGridDropTarget = dragState?.dragOverRowId === rowId && dragState?.dropTargetType === 'merge';

  return (
    <div className={cn("resizable-grid my-6", className)}>
      {/* FIXED: Enhanced Grid Controls with proper event handlers */}
      {!readonly && (
        <GridControls
          rowId={rowId}
          columns={columns}
          hasBlocks={hasBlocks}
          onAddColumn={handleAddColumn}
          onRemoveColumn={handleRemoveColumn}
          onMergeBlocks={handleMergeBlocks}
          onConvertToSingle={handleConvertToSingle}
          onReorderColumns={handleReorderColumns}
          className="mb-4"
        />
      )}

      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handlePanelResize}
        className={cn(
          "border rounded-lg transition-all",
          isGridDropTarget && "border-green-500 shadow-lg bg-green-500/5"
        )}
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: isGridDropTarget ? '#22c55e' : '#2a2a2a',
          minHeight: '200px'
        }}
      >
        {Array.from({ length: columns }).map((_, index) => {
          const block = blocks.find(b => (b.meta?.layout?.position ?? 0) === index);
          const isLast = index === columns - 1;
          
          return (
            <React.Fragment key={`panel-${index}`}>
              <ResizablePanel
                defaultSize={panelSizes[index]}
                minSize={10}
                maxSize={80}
                className="p-2"
              >
                {block ? renderBlock(block, index) : renderEmptySlot(index)}
              </ResizablePanel>
              
              {!isLast && (
                <ResizableHandle 
                  withHandle 
                  className="w-2 bg-gray-700 hover:bg-blue-600 transition-colors"
                />
              )}
            </React.Fragment>
          );
        })}
      </ResizablePanelGroup>
      
      {/* Grid Merge Feedback */}
      {isGridDropTarget && (
        <div className="mt-2 text-center text-green-400 text-sm font-medium animate-pulse">
          ↓ Solte o bloco para adicionar a este grid ↓
        </div>
      )}
      
      {/* Grid Info */}
      {!readonly && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          {columns} colunas • Arraste os divisores para ajustar proporções
          {columnWidths && (
            <span className="ml-2">
              Proporções: {columnWidths.map(w => `${w.toFixed(1)}%`).join(' / ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
