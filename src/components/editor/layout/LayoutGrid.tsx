
// ABOUTME: Defines a resizable grid layout for arranging content blocks.
// Supports dynamic column adjustments and block interactions within the grid.

import React from 'react';
import { LayoutRow } from './LayoutRow'; // Corrected: Removed LayoutRowData if not an exported type
import { ReviewBlock, BlockType } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResizableGridProps } from './ResizableGrid'; // Assuming ResizableGridProps is defined here or imported

// Define LayoutRowData locally if it's just a structure for this component
interface LayoutRowData {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  columnWidths?: number[];
}


interface LayoutGridProps {
  rows: LayoutRowData[];
  onUpdateLayout: (rowId: string, updates: { columnWidths?: number[], columns?: number }) => void;
  onAddBlock: (rowId: string, position: number, blockType?: BlockType) => void; // Made blockType optional
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void; // blockId to string
  onDeleteBlock: (blockId: string) => void; // blockId to string
  onAddRow: (position?: number) => void;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  // Props for drag and drop, from ResizableGridProps or similar
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
    <div className="layout-grid space-y-2"> {/* Reduced space-y from 4 to 2 */}
      {rows.map((row, rowIndex) => (
        <div key={row.id} className="layout-grid-row-wrapper">
          <LayoutRow
            rowId={row.id}
            blocks={row.blocks}
            columns={row.columns}
            columnWidths={row.columnWidths}
            onUpdateLayout={onUpdateLayout}
            onAddBlock={(position, blockType) => onAddBlock(row.id, position, blockType)} // Pass rowId
            onUpdateBlock={onUpdateBlock} // Pass through
            onDeleteBlock={onDeleteBlock} // Pass through
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            dragState={dragState}
            onDragOver={onDragOver ? (e, pos) => onDragOver(e, row.id, pos) : undefined}
            onDragLeave={onDragLeave}
            onDrop={onDrop ? (e, pos) => onDrop(e, row.id, pos) : undefined}
            onDragStart={onDragStart}
          />
          <div className="flex justify-center mt-1"> {/* Reduced mt from 2 to 1 */}
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
