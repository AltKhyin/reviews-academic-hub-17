
// ABOUTME: Resizable grid layout with draggable dividers for dynamic column proportions
// Uses react-resizable-panels for smooth resizing experience

import React, { useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className
}) => {
  // Calculate default sizes if no custom widths provided
  const defaultSizes = columnWidths || Array(columns).fill(100 / columns);
  
  // Ensure we have the right number of sizes
  const panelSizes = defaultSizes.length === columns 
    ? defaultSizes 
    : Array(columns).fill(100 / columns);

  // Handle panel resize
  const handlePanelResize = useCallback((sizes: number[]) => {
    onUpdateLayout(rowId, { columnWidths: sizes });
  }, [rowId, onUpdateLayout]);

  // Handle block click
  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    if (!readonly && onActiveBlockChange) {
      const target = event.target as Element;
      const isInteractiveElement = target.closest('.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select');
      
      if (!isInteractiveElement) {
        onActiveBlockChange(activeBlockId === blockId ? null : blockId);
      }
    }
  }, [activeBlockId, onActiveBlockChange, readonly]);

  // Render empty slot for adding blocks
  const renderEmptySlot = (position: number) => (
    <div
      className={cn(
        "min-h-[120px] border-2 border-dashed rounded-lg flex items-center justify-center transition-all",
        "border-gray-600 hover:border-gray-500"
      )}
      style={{ borderColor: '#2a2a2a' }}
    >
      {!readonly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddBlock(rowId, position)}
          className="text-gray-400 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloco
        </Button>
      )}
    </div>
  );

  // Render block with controls
  const renderBlock = (block: ReviewBlock, position: number) => {
    const isActive = activeBlockId === block.id;

    return (
      <div className="relative group h-full">
        <div
          className={cn(
            "h-full transition-all duration-200 cursor-pointer rounded-lg",
            isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
            !block.visible && "opacity-50"
          )}
          style={{ 
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            borderColor: isActive ? '#3b82f6' : 'transparent'
          }}
          onClick={(e) => handleBlockClick(block.id, e)}
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

  return (
    <div className={cn("resizable-grid my-6", className)}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={handlePanelResize}
        className="border rounded-lg"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a',
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
      
      {/* Grid Info */}
      {!readonly && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          {columns} colunas • Arraste os divisores para ajustar proporções
        </div>
      )}
    </div>
  );
};
