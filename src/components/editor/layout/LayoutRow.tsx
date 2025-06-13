
// ABOUTME: Layout row component managing horizontal block arrangements
// Fixed prop naming and interface consistency

import React, { useState, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { LayoutRowData, LayoutRowProps } from '@/types/grid';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row,
  onUpdateRow,
  onDeleteRow,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDeleteBlock,
  readonly = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);

  // Calculate column widths
  const columnWidths = row.columnWidths || Array(row.columns).fill(100 / row.columns);

  const handleColumnWidthChange = useCallback((columnIndex: number, newWidth: number) => {
    const newWidths = [...columnWidths];
    newWidths[columnIndex] = newWidth;
    
    // Ensure total width is 100%
    const total = newWidths.reduce((sum, width) => sum + width, 0);
    if (total !== 100) {
      const adjustment = 100 / total;
      newWidths.forEach((width, index) => {
        newWidths[index] = width * adjustment;
      });
    }
    
    onUpdateRow(row.id, { columnWidths: newWidths });
  }, [columnWidths, onUpdateRow, row.id]);

  const handleAddBlock = useCallback((columnIndex: number) => {
    onAddBlock(row.id, columnIndex, 'paragraph');
  }, [onAddBlock, row.id]);

  const getBlocksForColumn = useCallback((columnIndex: number) => {
    return row.blocks.filter(block => {
      const layoutColumn = block.meta?.layout?.grid_position?.column;
      return layoutColumn === columnIndex;
    });
  }, [row.blocks]);

  if (readonly) {
    return (
      <div className="layout-row grid gap-4" style={{ gridTemplateColumns: columnWidths.map(w => `${w}%`).join(' ') }}>
        {Array.from({ length: row.columns }, (_, columnIndex) => {
          const columnBlocks = getBlocksForColumn(columnIndex);
          
          return (
            <div key={columnIndex} className="layout-column space-y-4">
              {columnBlocks.map(block => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  readonly={true}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "layout-row border rounded-lg p-4 transition-all",
        isHovered ? "border-blue-500 bg-blue-500/10" : "border-gray-600 bg-gray-800/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            {row.columns} {row.columns === 1 ? 'coluna' : 'colunas'}
          </span>
        </div>
        
        {isHovered && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteRow(row.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Columns Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: columnWidths.map(w => `${w}%`).join(' ') }}>
        {Array.from({ length: row.columns }, (_, columnIndex) => {
          const columnBlocks = getBlocksForColumn(columnIndex);
          
          return (
            <div 
              key={columnIndex} 
              className={cn(
                "layout-column min-h-[100px] border-2 border-dashed rounded-lg p-3 space-y-3",
                draggedOver === columnIndex ? "border-blue-400 bg-blue-400/10" : "border-gray-600"
              )}
            >
              {/* Column Blocks */}
              {columnBlocks.map(block => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                  onMove={(direction) => onMoveBlock(block.id, direction)}
                  onDelete={() => onDeleteBlock(block.id)}
                  readonly={false}
                />
              ))}
              
              {/* Add Block Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddBlock(columnIndex)}
                className="w-full border-2 border-dashed border-gray-600 hover:border-blue-400 text-gray-400 hover:text-blue-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bloco
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
