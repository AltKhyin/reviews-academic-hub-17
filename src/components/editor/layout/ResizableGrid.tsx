// ABOUTME: Enhanced resizable grid component with complete string ID support
// Provides resizable grid functionality with proper column management

import React, { useState, useCallback, useEffect } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null;
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
  gap: number;
  columnWidths?: number[];
  onUpdateLayout: (rowId: string, updates: { columnWidths: number[] }) => void;
  onAddBlock: (rowId: string, position: number, blockType?: BlockType) => void; // Added blockType as optional
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void; // Corrected: was onActive
  dragState: DragState;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

export const ResizableGrid: React.FC<ResizableGridProps> = ({
  rowId,
  blocks,
  columns,
  gap,
  columnWidths,
  onUpdateLayout,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  activeBlockId,
  onActiveBlockChange,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [localColumnWidths, setLocalColumnWidths] = useState(
    columnWidths || Array(columns).fill(100 / columns)
  );

  // Update localColumnWidths if the prop changes from outside
  useEffect(() => {
    setLocalColumnWidths(columnWidths || Array(columns).fill(100 / columns));
  }, [columnWidths, columns]);

  const handleMoveInGrid = useCallback((blockId: string, direction: 'up' | 'down') => {
    console.log('ResizableGrid block movement:', { blockId, direction, rowId });
    // Movement logic within this grid (e.g., if it's a single column behaving like a list)
    // or defer to parent drag/drop. For now, it's mostly for BlockContentEditor.
  }, [rowId]);

  const handleAddBlockAtPositionInCell = useCallback((type: BlockType, position?: number) => {
    // This is called from BlockContentEditor, position is relative to that block.
    // For ResizableGrid, adding a block usually means into an empty cell or replacing one.
    // The 'position' here needs to map to a column index.
    // Assuming BlockContentEditor's onAddBlock is for *within* its own content or adding *after* itself.
    // For adding to an empty cell, we use handleAddBlockToColumn.
    const targetColumnIndex = position !== undefined ? position : blocks.findIndex(b => !b); // Find first empty or append
    if (targetColumnIndex !== -1) {
      onAddBlock(rowId, targetColumnIndex, type);
    } else {
      onAddBlock(rowId, blocks.length, type); // Add to end if all full
    }
  }, [onAddBlock, rowId, blocks]);
  
  const handleAddBlockToColumn = useCallback((columnIndex: number) => {
    onAddBlock(rowId, columnIndex, 'paragraph' as BlockType); // Default to paragraph
  }, [onAddBlock, rowId]);

  const handleColumnResize = useCallback((columnIndex: number, newWidth: number) => {
    const newWidths = [...localColumnWidths];
    const oldWidth = newWidths[columnIndex];
    const diff = newWidth - oldWidth;
    
    // Adjust the next column to compensate
    if (columnIndex < newWidths.length - 1) {
      newWidths[columnIndex + 1] = Math.max(10, newWidths[columnIndex + 1] - diff);
    }
    
    newWidths[columnIndex] = Math.max(10, newWidth);
    
    // Ensure total width is maintained (optional, can lead to complex adjustments)
    // For simplicity, we might allow slight overflow/underflow or require manual balancing.
    // Or normalize:
    // const totalWidth = newWidths.reduce((sum, w) => sum + w, 0);
    // if (totalWidth !== 100) {
    //   const scale = 100 / totalWidth;
    //   newWidths = newWidths.map(w => w * scale);
    // }

    setLocalColumnWidths(newWidths);
    onUpdateLayout(rowId, { columnWidths: newWidths });
  }, [localColumnWidths, onUpdateLayout, rowId]);

  return (
    <div className="resizable-grid border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800/30">
      {/* Grid Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            Grid Redimensionável: {columns} colunas
          </span>
          <span className="text-xs text-gray-500">#{rowId}</span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-gray-300"
          title="Configurações do Grid"
          // onClick={() => { /* Open grid settings modal */ }}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid Layout */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: localColumnWidths.map(w => `${w}%`).join(' '),
          gap: `${gap}px`
        }}
        onDragOver={(e) => onDragOver(e, rowId, undefined, 'merge')}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, rowId, undefined, 'merge')}
      >
        {Array.from({ length: columns }).map((_, index) => {
          const block = blocks[index]; // Assuming blocks array corresponds to columns
          
          return (
            <div
              key={`resizable-grid-item-${rowId}-${index}`}
              className={cn(
                "resizable-grid-item relative border-2 border-dashed rounded min-h-[120px]",
                block ? "border-gray-700 bg-gray-900/20" : "border-gray-800 hover:border-gray-700",
                "transition-all duration-200",
                dragState.dragOverRowId === rowId && dragState.dragOverPosition === index && "ring-2 ring-blue-400 border-blue-500",
                activeBlockId && block && activeBlockId === block.id && "ring-2 ring-blue-500 border-blue-500"
              )}
              style={{ borderColor: block ? '#374151' : '#2b3245' }}
              // Drag event handlers for individual cells if needed for finer-grained drop targets
              onDragOver={(e) => {
                e.stopPropagation(); // Prevent bubbling to the parent grid's onDragOver
                onDragOver(e, rowId, index, 'merge');
              }}
              onDrop={(e) => {
                e.stopPropagation();
                onDrop(e, rowId, index, 'merge');
              }}
            >
              {/* Column Resizer */}
              {index < columns - 1 && (
                <div
                  className="absolute top-0 -right-1 w-2 h-full cursor-col-resize bg-gray-600 opacity-0 hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => {
                    setIsResizing(true);
                    const startX = e.clientX;
                    const startWidths = [...localColumnWidths]; // Work with a copy
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const currentDiffX = moveEvent.clientX - startX;
                      const newWidths = [...startWidths];
                      
                      // Calculate percentage change based on grid width (approximate)
                      // This needs a reference to the grid's actual pixel width for accuracy,
                      // or calculate diff as percentage of window width.
                      // For simplicity, let's assume a fixed grid width or use a simpler diff logic.
                      // This part is tricky without knowing the parent width.
                      // A common approach is to convert pixel diff to percentage diff.
                      const parentGridWidth = (e.currentTarget.parentElement?.parentElement?.offsetWidth) || window.innerWidth;
                      const diffPercent = (currentDiffX / parentGridWidth) * 100;

                      if (newWidths[index] + diffPercent > 5 && newWidths[index+1] - diffPercent > 5) { // Min width 5%
                        newWidths[index] += diffPercent;
                        newWidths[index+1] -= diffPercent;
                        setLocalColumnWidths(newWidths); // Update UI optimistically
                      }
                    };
                    
                    const handleMouseUp = () => {
                      setIsResizing(false);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      onUpdateLayout(rowId, { columnWidths: localColumnWidths }); // Final update
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              )}

              {block ? (
                <BlockContentEditor
                  block={block}
                  isActive={activeBlockId === block.id}
                  isFirst={index === 0}
                  isLast={index === columns - 1}
                  onSelect={onActiveBlockChange}
                  onUpdate={onUpdateBlock}
                  onDelete={onDeleteBlock}
                  onMove={handleMoveInGrid}
                  onAddBlock={handleAddBlockAtPositionInCell}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBlockToColumn(index)}
                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Bloco
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid Info */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Larguras: {localColumnWidths.map(w => `${w.toFixed(1)}%`).join(', ')}
        </div>
        <div className="text-xs text-gray-500">
          {blocks.filter(Boolean).length}/{columns} células preenchidas
        </div>
      </div>
    </div>
  );
};
