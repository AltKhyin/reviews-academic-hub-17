
// ABOUTME: Multi-block layout row container with drag & drop support
// Manages horizontal arrangement of blocks with responsive breakpoints

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Grip, 
  Columns2, 
  Columns3, 
  Columns4,
  Trash2,
  Move
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
  responsive: {
    sm: number;
    md: number;
    lg: number;
  };
}

interface LayoutRowProps {
  row: LayoutRowData;
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void;
  onDeleteRow: (rowId: string) => void;
  onAddBlock: (rowId: string, position: number, blockType: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void; // Changed from number to string
  onMoveBlock: (blockId: string, targetRowId: string, targetPosition: number) => void; // Changed from number to string
  onDeleteBlock: (blockId: string) => void; // Changed from number to string
  readonly?: boolean;
  className?: string;
}

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row,
  onUpdateRow,
  onDeleteRow,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDeleteBlock,
  readonly = false,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null); // Changed from number to string
  const [showControls, setShowControls] = useState(false);

  // Generate responsive grid classes
  const getGridClasses = () => {
    const baseClass = `grid gap-${row.gap}`;
    const responsiveClasses = [
      `grid-cols-${row.responsive.sm}`,
      `md:grid-cols-${row.responsive.md}`,
      `lg:grid-cols-${row.columns}`
    ].join(' ');
    
    return `${baseClass} ${responsiveClasses}`;
  };

  // Handle column count changes
  const handleColumnChange = (newColumns: number) => {
    const newResponsive = {
      sm: Math.min(newColumns, 2), // Max 2 columns on small screens
      md: Math.min(newColumns, 3), // Max 3 columns on medium screens  
      lg: newColumns
    };

    onUpdateRow(row.id, {
      columns: newColumns,
      responsive: newResponsive
    });
  };

  // Handle drag events
  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setIsDragging(false);
  };

  const handleDrop = (position: number) => {
    if (draggedBlock && onMoveBlock) {
      onMoveBlock(draggedBlock, row.id, position);
    }
    handleDragEnd();
  };

  // Create wrapper function for onUpdate
  const createBlockUpdateWrapper = (blockId: string) => {
    return (updates: Partial<ReviewBlock>) => {
      onUpdateBlock(blockId, updates);
    };
  };

  // Render empty slot for adding blocks
  const renderEmptySlot = (position: number) => (
    <div
      key={`empty-${position}`}
      className={cn(
        "min-h-[120px] border-2 border-dashed rounded-lg flex items-center justify-center transition-all",
        isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
      )}
      style={{ borderColor: '#2a2a2a' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(position)}
    >
      {!readonly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddBlock(row.id, position, 'paragraph')}
          className="text-gray-400 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloco
        </Button>
      )}
    </div>
  );

  // Render block with position controls
  const renderBlock = (block: ReviewBlock, position: number) => (
    <div
      key={block.id}
      className="relative group"
      draggable={!readonly}
      onDragStart={() => handleDragStart(block.id)}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      {!readonly && (
        <div className="absolute -top-2 -left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 cursor-move"
            title="Arrastar bloco"
          >
            <Move className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Block Content */}
      <BlockRenderer
        block={block}
        onUpdate={createBlockUpdateWrapper(block.id)}
        readonly={readonly}
        className={cn(
          "transition-all duration-200",
          isDragging && draggedBlock === block.id && "opacity-50 scale-95"
        )}
      />

      {/* Delete Button */}
      {!readonly && (
        <div className="absolute -top-2 -right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteBlock(block.id)}
            className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
            title="Remover bloco"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );

  if (readonly) {
    return (
      <div className={cn("layout-row my-6", className)}>
        <div className={getGridClasses()}>
          {row.blocks.map((block, position) => renderBlock(block, position))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("layout-row my-6 group relative", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Row Controls */}
      <div className={cn(
        "absolute -top-3 left-0 right-0 flex items-center justify-between z-10 transition-opacity",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
            title="Arrastar linha"
          >
            <Grip className="w-3 h-3" />
          </Button>

          {/* Column Controls */}
          <div className="flex items-center gap-1">
            {[2, 3, 4].map((cols) => {
              const Icon = cols === 2 ? Columns2 : cols === 3 ? Columns3 : Columns4;
              return (
                <Button
                  key={cols}
                  variant={row.columns === cols ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleColumnChange(cols)}
                  className="h-6 w-6 p-0"
                  title={`${cols} colunas`}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              );
            })}
          </div>

          {/* Gap Control */}
          <select
            value={row.gap}
            onChange={(e) => onUpdateRow(row.id, { gap: parseInt(e.target.value) })}
            className="h-6 px-2 text-xs bg-gray-800 border border-gray-600 rounded"
            style={{ color: '#ffffff' }}
          >
            <option value={2}>Gap: 2</option>
            <option value={4}>Gap: 4</option>
            <option value={6}>Gap: 6</option>
            <option value={8}>Gap: 8</option>
          </select>
        </div>

        {/* Delete Row */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteRow(row.id)}
          className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
          title="Remover linha"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Grid Container */}
      <div className={getGridClasses()}>
        {/* Render existing blocks */}
        {row.blocks.map((block, position) => renderBlock(block, position))}
        
        {/* Render empty slots */}
        {Array.from({ length: row.columns - row.blocks.length }, (_, index) => 
          renderEmptySlot(row.blocks.length + index)
        )}
      </div>
    </div>
  );
};
