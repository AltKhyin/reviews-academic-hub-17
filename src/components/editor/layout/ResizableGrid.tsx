
// ABOUTME: Enhanced resizable grid layout with advanced operations and improved synchronization
// Uses shared grid utilities for consistent rendering and enhanced column management

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

  // Enhanced grid operations
  const {
    addColumnToGrid,
    removeColumnFromGrid,
    mergeGridBlocks,
    convertGridToSingle,
    reorderGridColumns
  } = useEnhancedGridOperations({
    blocks: blocks, // Pass all blocks for context
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock: (type, position, layoutInfo) => {
      // This is a simplified adapter - in real implementation you'd need to handle this properly
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

  // Handle panel resize with immediate feedback
  const handlePanelResize = useCallback((sizes: number[]) => {
    console.log('Panel resize:', { rowId, oldSizes: panelSizes, newSizes: sizes });
    
    const normalizedWidths = panelSizesToColumnWidths(sizes);
    onUpdateLayout(rowId, { columnWidths: normalizedWidths });
  }, [rowId, onUpdateLayout, panelSizes]);

  // Handle block click for selection
  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    if (!readonly && onActiveBlockChange) {
      const target = event.target as Element;
      const isInteractiveElement = target.closest('.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select');
      
      if (!isInteractiveElement) {
        onActiveBlockChange(activeBlockId === blockId ? null : blockId);
      }
    }
  }, [activeBlockId, onActiveBlockChange, readonly]);

  // Enhanced grid operations handlers
  const handleAddColumn = useCallback(() => {
    addColumnToGrid(rowId);
  }, [addColumnToGrid, rowId]);

  const handleRemoveColumn = useCallback((columnIndex: number) => {
    removeColumnFromGrid(rowId, columnIndex);
  }, [removeColumnFromGrid, rowId]);

  const handleMergeBlocks = useCallback((leftIndex: number, rightIndex: number) => {
    mergeGridBlocks(rowId, leftIndex, rightIndex);
  }, [mergeGridBlocks, rowId]);

  const handleConvertToSingle = useCallback((mergeContent: boolean) => {
    convertGridToSingle(rowId, mergeContent);
  }, [convertGridToSingle, rowId]);

  const handleReorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    reorderGridColumns(rowId, fromIndex, toIndex);
  }, [reorderGridColumns, rowId]);

  // Enhanced drag handlers for grid - Fixed typing
  const handleGridDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, position?: number) => {
    if (onDragOver && dragState?.isDragging) {
      onDragOver(e, rowId, position, 'merge');
    }
  }, [onDragOver, rowId, dragState]);

  const handleGridDrop = useCallback((e: React.DragEvent<HTMLDivElement>, position?: number) => {
    if (onDrop && dragState?.isDragging) {
      onDrop(e, rowId, position, 'merge');
    }
  }, [onDrop, rowId, dragState]);

  const handleGridDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (onDragLeave) {
      onDragLeave(e);
    }
  }, [onDragLeave]);

  // Render empty slot for adding blocks
  const renderEmptySlot = (position: number) => {
    const isDropTarget = dragState?.dragOverRowId === rowId && 
                        dragState?.dragOverPosition === position && 
                        dragState?.dropTargetType === 'merge';

    return (
      <div
        className={cn(
          "min-h-[120px] border-2 border-dashed rounded-lg flex items-center justify-center transition-all relative",
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
            <span className="text-green-400 font-medium">Soltar aqui para adicionar ao grid</span>
          </div>
        )}
        
        {!readonly && !isDropTarget && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Adding block to grid:', { rowId, position });
              onAddBlock(rowId, position);
            }}
            className="text-gray-400 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco
          </Button>
        )}
      </div>
    );
  };

  // Render block with controls and enhanced drag support
  const renderBlock = (block: ReviewBlock, position: number) => {
    const isActive = activeBlockId === block.id;
    const isDragging = dragState?.draggedBlockId === block.id;
    const isDropTarget = dragState?.dragOverRowId === rowId && 
                        dragState?.dragOverPosition === position && 
                        dragState?.dropTargetType === 'merge';

    return (
      <div className="relative group h-full">
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
            isDragging && "opacity-50 scale-95"
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
          {/* Block Controls */}
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
      {/* Enhanced Grid Controls - Only show in edit mode */}
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
          isGridDropTarget && "border-green-500 shadow-lg"
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
