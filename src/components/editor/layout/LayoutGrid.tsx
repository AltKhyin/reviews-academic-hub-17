
// ABOUTME: Defines a resizable grid layout for arranging content blocks.
// Supports dynamic column adjustments and block interactions within the grid.

import React from 'react';
import { LayoutRow } from './LayoutRow'; 
import { ReviewBlock, BlockType } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Define LayoutRowData locally if it's just a structure for this component
interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
}

// Local definition for ResizableGridProps if not exportable/available
// This is a minimal definition based on usage in BlockEditor and errors.
export interface ResizableGridProps {
  rowId: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
  gap?: number;
  onUpdateLayout: (rowId: string, updates: { columnWidths?: number[], columns?: number }) => void;
  onAddBlock: (rowId: string, position: number, blockType?: BlockType) => string; // Changed: returns string (new block ID)
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlockToRow: (draggedBlockId: string, targetRowId: string, targetPosition?: number) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void; // Added based on error in BlockEditor.tsx
  onDragStart?: (e: React.DragEvent, blockId: string, rowId: string) => void;
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number) => void;
}

// Local definition for LayoutRowProps
interface LayoutRowProps {
  rowId: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
  onUpdateLayout: (rowId: string, updates: { columnWidths?: number[], columns?: number }) => void; // Added
  onAddBlock: (position: number, blockType?: BlockType) => void; // Position is number
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  dragState?: any; 
  onDragOver?: (e: React.DragEvent, targetPosition?: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetPosition?: number) => void;
  onDragStart?: (e: React.DragEvent, blockId: string) => void;
}


interface LayoutGridProps {
  rows: LayoutRowData[];
  onUpdateLayout: (rowId: string, updates: { columnWidths?: number[], columns?: number }) => void;
  onAddBlock: (rowId: string, position: number, blockType?: BlockType) => void; // Kept void return type as per original
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddRow: (position?: number) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  dragState?: any; 
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number) => void;
  onDragStart?: (e: React.DragEvent, blockId: string) => void;
}

export const LayoutGrid: React.FC<LayoutGridProps> = ({
  rows,
  onUpdateLayout,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onAddRow,
  activeBlockId,
  onActiveBlockChange,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}) => {
  return (
    <div className="layout-grid space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={row.id} className="layout-grid-row-wrapper">
          <LayoutRow
            rowId={row.id}
            blocks={row.blocks}
            columns={row.columns}
            columnWidths={row.columnWidths}
            onUpdateLayout={onUpdateLayout} // Prop now exists on LayoutRowProps
            onAddBlock={(position: number, blockType?: BlockType) => onAddBlock(row.id, position, blockType)} // position is number
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            dragState={dragState}
            onDragOver={onDragOver ? (e, pos) => onDragOver(e, row.id, pos) : undefined}
            onDragLeave={onDragLeave}
            onDrop={onDrop ? (e, pos) => onDrop(e, row.id, pos) : undefined}
            onDragStart={onDragStart}
          />
          <div className="flex justify-center mt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAddRow(rowIndex + 1)}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Row Below
            </Button>
          </div>
        </div>
      ))}
      {rows.length === 0 && (
         <div className="flex justify-center mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAddRow(0)}
              className="text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Add First Row
            </Button>
          </div>
      )}
    </div>
  );
};

