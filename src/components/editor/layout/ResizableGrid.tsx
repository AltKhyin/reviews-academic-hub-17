// ABOUTME: Refactored resizable grid with improved modularity and performance
// Uses GridPanel components for better separation of concerns - UPDATED: Reduced spacing by 50%

import React, { useCallback, useMemo } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ReviewBlock } from '@/types/review';
import { GridControls } from './GridControls';
import { GridPanel } from './GridPanel';
import { useEnhancedGridOperations } from '@/hooks/useEnhancedGridOperations';
import { cn } from '@/lib/utils';
import { 
  columnWidthsToPanelSizes, 
  panelSizesToColumnWidths
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
    blocks: blocks,
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock: (type, position, layoutInfo) => {
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
    panelSizes
  });

  // Debounced panel resize handler with proper normalization
  const handlePanelResize = useCallback((sizes: number[]) => {
    const normalizedWidths = panelSizesToColumnWidths(sizes);
    
    const hasSignificantChange = columnWidths ? 
      normalizedWidths.some((width, index) => Math.abs(width - (columnWidths[index] || 0)) > 0.5) :
      true;

    if (hasSignificantChange) {
      console.log('Panel resize with significant change:', { rowId, newSizes: normalizedWidths });
      onUpdateLayout(rowId, { columnWidths: normalizedWidths });
    }
  }, [rowId, onUpdateLayout, columnWidths]);

  // Grid operations handlers
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

  const handleAddBlockToPosition = useCallback((targetRowId: string, position: number) => {
    console.log('Adding block to grid position:', { targetRowId, position });
    
    const row = blocks.find(b => b.meta?.layout?.row_id === targetRowId);
    if (row) {
      const rowBlocks = blocks.filter(b => b.meta?.layout?.row_id === targetRowId);
      const lastBlockInRow = rowBlocks[rowBlocks.length - 1];
      const insertionIndex = lastBlockInRow ? 
        blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
        blocks.length;
      
      onAddBlock(targetRowId, insertionIndex);
    } else {
      onAddBlock(targetRowId, position);
    }
  }, [blocks, onAddBlock]);

  const hasBlocks = blocks.length > 0;
  const isGridDropTarget = dragState?.dragOverRowId === rowId && dragState?.dropTargetType === 'merge';

  return (
    <div className={cn("resizable-grid my-3", className)}>
      {/* Grid Controls */}
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
          className="mb-2"
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
            <div key={`panel-wrapper-${index}`}>
              <ResizablePanel
                defaultSize={panelSizes[index]}
                minSize={10}
                maxSize={80}
                className="p-1"
              >
                <GridPanel
                  rowId={rowId}
                  position={index}
                  block={block}
                  readonly={readonly}
                  activeBlockId={activeBlockId}
                  dragState={dragState}
                  onActiveBlockChange={onActiveBlockChange}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onAddBlock={handleAddBlockToPosition}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                />
              </ResizablePanel>
              
              {!isLast && (
                <ResizableHandle 
                  withHandle 
                  className="w-2 bg-gray-700 hover:bg-blue-600 transition-colors"
                />
              )}
            </div>
          );
        })}
      </ResizablePanelGroup>
      
      {/* Grid Merge Feedback */}
      {isGridDropTarget && (
        <div className="mt-1 text-center text-green-400 text-sm font-medium animate-pulse">
          ↓ Solte o bloco para adicionar a este grid ↓
        </div>
      )}
      
      {/* Grid Info */}
      {!readonly && (
        <div className="mt-1 text-xs text-gray-400 text-center">
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
