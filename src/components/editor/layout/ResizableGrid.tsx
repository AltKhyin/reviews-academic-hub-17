// ABOUTME: A component for a resizable grid layout, likely for a single block area.
// This file might be a conceptual placeholder or a specific type of grid interaction.
// Given the error, it seems to use BlockContentEditor internally.

import React from 'react';
import { ReviewBlock, AddBlockOptions, BlockType } from '@/types/review';
import { BlockContentEditor, BlockContentEditorProps } from '../BlockContentEditor';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ResizableGridProps {
  block: ReviewBlock; // The block this resizable grid might be for
  activeBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  // ... other props for resizing logic, child blocks if it's a container
  readonly?: boolean;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export const ResizableGrid: React.FC<ResizableGridProps> = ({
  block,
  activeBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  readonly,
  initialWidth = 300,
  initialHeight = 200,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 800,
  maxHeight = 600,
  className,
}) => {
  const [width, setWidth] = React.useState(initialWidth);
  const [height, setHeight] = React.useState(initialHeight);
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeDirection, setResizeDirection] = React.useState<'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw' | null>(null);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = React.useState({ width: 0, height: 0 });

  const isActive = activeBlockId === block.id;

  const handleResizeStart = (e: React.MouseEvent, direction: 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ width, height });
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    let newWidth = startDimensions.width;
    let newHeight = startDimensions.height;
    
    // Handle width changes
    if (['e', 'ne', 'se'].includes(resizeDirection)) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startDimensions.width + deltaX));
    } else if (['w', 'nw', 'sw'].includes(resizeDirection)) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startDimensions.width - deltaX));
    }
    
    // Handle height changes
    if (['n', 'ne', 'nw'].includes(resizeDirection)) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, startDimensions.height - deltaY));
    } else if (['s', 'se', 'sw'].includes(resizeDirection)) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, startDimensions.height + deltaY));
    }
    
    setWidth(newWidth);
    setHeight(newHeight);
    
    // Update block meta with new dimensions
    onUpdateBlock(block.id, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          width: newWidth,
          height: newHeight,
        }
      }
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const bceProps: BlockContentEditorProps = {
    block: block,
    isActive: isActive,
    onSelect: () => onSelectBlock(block.id),
    onUpdate: onUpdateBlock,
    onDelete: onDeleteBlock,
    onMove: (id, dir) => console.log('Move from ResizableGrid BDE', id, dir), // Placeholder
    onAddBlock: (options: Partial<AddBlockOptions> & { type: BlockType; }) => console.log('Add from ResizableGrid BDE', options), // Placeholder
    readonly: readonly,
  };

  return (
    <div 
      className={cn(
        "resizable-grid relative",
        isActive && "ring-2 ring-blue-500",
        isResizing && "select-none",
        className
      )}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        cursor: isResizing ? (
          resizeDirection === 'n' || resizeDirection === 's' ? 'ns-resize' :
          resizeDirection === 'e' || resizeDirection === 'w' ? 'ew-resize' :
          resizeDirection === 'ne' || resizeDirection === 'sw' ? 'nesw-resize' :
          resizeDirection === 'nw' || resizeDirection === 'se' ? 'nwse-resize' : 'move'
        ) : 'default'
      }}
      onClick={() => onSelectBlock(block.id)}
    >
      <BlockContentEditor {...bceProps} />
      
      {!readonly && isActive && (
        <>
          {/* Resize handles */}
          <div 
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          
          {/* Corner handles */}
          <div 
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Size indicator */}
          <div className="absolute bottom-1 right-1 bg-gray-800/80 text-xs text-gray-300 px-1 rounded">
            {width} × {height}
          </div>
          
          {/* Control buttons */}
          <div className="absolute top-1 right-1 flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-5 h-5 bg-gray-800/80 text-gray-300 hover:bg-gray-700"
              onClick={() => {
                setWidth(initialWidth);
                setHeight(initialHeight);
                onUpdateBlock(block.id, {
                  meta: {
                    ...block.meta,
                    layout: {
                      ...block.meta?.layout,
                      width: initialWidth,
                      height: initialHeight,
                    }
                  }
                });
              }}
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-5 h-5 bg-gray-800/80 text-gray-300 hover:bg-gray-700"
              onClick={() => {
                const newWidth = maxWidth;
                const newHeight = maxHeight;
                setWidth(newWidth);
                setHeight(newHeight);
                onUpdateBlock(block.id, {
                  meta: {
                    ...block.meta,
                    layout: {
                      ...block.meta?.layout,
                      width: newWidth,
                      height: newHeight,
                    }
                  }
                });
              }}
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
