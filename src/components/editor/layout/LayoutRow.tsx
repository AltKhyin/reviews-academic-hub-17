
// ABOUTME: Enhanced layout row component with proper type definitions
// Manages individual rows within layout grids with consistent block ID handling

import React, { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockContentEditor } from '../BlockContentEditor';
import { ResizableGrid } from './ResizableGrid';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Settings, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LayoutRowData {
  id: string;
  type: 'single' | 'multi' | 'grid';
  columns: number;
  gap: number;
  blocks: ReviewBlock[];
  columnWidths?: number[];
  gridSettings?: {
    autoResize: boolean;
    minColumnWidth: number;
    maxColumnWidth: number;
  };
}

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface LayoutRowProps {
  row: LayoutRowData;
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void;
  onDeleteRow: (rowId: string) => void;
  onAddBlock: (rowId: string, position: number, blockType?: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onMoveBlock: (blockId: string, targetRowId: string, targetPosition: number) => void;
  onDeleteBlock: (blockId: string) => void;
  readonly?: boolean;
  activeBlockId?: string | null;
  onActiveBlockChange?: (blockId: string | null) => void;
  dragState?: DragState;
  onDragOver?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

const defaultDragState: DragState = {
  draggedBlockId: null,
  dragOverRowId: null,
  dragOverPosition: null,
  isDragging: false,
  draggedFromRowId: null,
  dropTargetType: null,
};

export const LayoutRow: React.FC<LayoutRowProps> = ({
  row,
  onUpdateRow,
  onDeleteRow,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDeleteBlock,
  readonly = false,
  activeBlockId = null,
  onActiveBlockChange = () => {},
  dragState = defaultDragState,
  onDragOver = () => {},
  onDragLeave = () => {},
  onDrop = () => {}
}) => {
  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    // Row block movement is handled by moving between rows
    console.log('Row block movement:', { blockId, direction, rowId: row.id });
  }, [row.id]);

  const handleAddBlockAtPosition = useCallback((type: any, position?: number) => {
    if (position !== undefined) {
      onAddBlock(row.id, position, type);
    } else {
      onAddBlock(row.id, row.blocks.length, type);
    }
  }, [onAddBlock, row.id, row.blocks.length]);

  const handleColumnCountChange = useCallback((newColumns: number) => {
    const updates: Partial<LayoutRowData> = {
      columns: Math.max(1, Math.min(4, newColumns)),
    };
    
    // Adjust column widths if necessary
    if (newColumns !== row.columns) {
      updates.columnWidths = Array(newColumns).fill(100 / newColumns);
    }
    
    onUpdateRow(row.id, updates);
  }, [row.id, row.columns, onUpdateRow]);

  const handleLayoutUpdate = useCallback((rowId: string, updates: { columnWidths: number[] }) => {
    onUpdateRow(rowId, updates);
  }, [onUpdateRow]);

  if (readonly) {
    return (
      <div className="layout-row mb-6">
        {row.type === 'grid' ? (
          <ResizableGrid
            rowId={row.id}
            blocks={row.blocks}
            columns={row.columns}
            gap={row.gap}
            columnWidths={row.columnWidths}
            onUpdateLayout={() => {}}
            onAddBlock={() => {}}
            onUpdateBlock={() => {}}
            onDeleteBlock={() => {}}
            activeBlockId={null}
            onActiveBlockChange={() => {}}
            dragState={defaultDragState}
            onDragOver={() => {}}
            onDragLeave={() => {}}
            onDrop={() => {}}
          />
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)` }}
          >
            {row.blocks.map((block) => (
              <div key={block.id} className="layout-cell">
                <BlockContentEditor
                  block={block}
                  isActive={false}
                  isFirst={false}
                  isLast={false}
                  onSelect={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onMove={() => {}}
                  onAddBlock={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="layout-row border border-gray-600 rounded-lg p-4 mb-6 bg-gray-900/5">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">
            Linha {row.type === 'grid' ? 'Grid' : 'Layout'}: {row.columns} colunas
          </span>
          <span className="text-xs text-gray-500">#{row.id}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Column Controls */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleColumnCountChange(row.columns - 1)}
            disabled={row.columns <= 1}
            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-300"
            title="Remover coluna"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="text-xs text-gray-400 px-2">{row.columns}</span>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleColumnCountChange(row.columns + 1)}
            disabled={row.columns >= 4}
            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-300"
            title="Adicionar coluna"
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-300"
            title="Configurações da linha"
          >
            <Settings className="w-3 h-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteRow(row.id)}
            className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
            title="Remover linha"
          >
            <Minus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Row Content */}
      {row.type === 'grid' ? (
        <ResizableGrid
          rowId={row.id}
          blocks={row.blocks}
          columns={row.columns}
          gap={row.gap}
          columnWidths={row.columnWidths}
          onUpdateLayout={handleLayoutUpdate}
          onAddBlock={onAddBlock}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          activeBlockId={activeBlockId}
          onActiveBlockChange={onActiveBlockChange}
          dragState={dragState}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)` }}
          onDragOver={(e) => onDragOver(e, row.id, undefined, 'single')}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, row.id, undefined, 'single')}
        >
          {Array.from({ length: row.columns }).map((_, index) => {
            const block = row.blocks[index];
            
            return (
              <div
                key={`layout-cell-${index}`}
                className={cn(
                  "layout-cell border-2 border-dashed border-gray-600 rounded min-h-[120px] p-2",
                  "transition-all duration-200",
                  block && "border-solid border-gray-500 bg-gray-900/10",
                  dragState.dragOverRowId === row.id && "ring-2 ring-blue-400"
                )}
              >
                {block ? (
                  <BlockContentEditor
                    block={block}
                    isActive={activeBlockId === block.id}
                    isFirst={index === 0}
                    isLast={index === row.columns - 1}
                    onSelect={onActiveBlockChange}
                    onUpdate={onUpdateBlock}
                    onDelete={onDeleteBlock}
                    onMove={handleMove}
                    onAddBlock={handleAddBlockAtPosition}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddBlock(row.id, index)}
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
      )}
    </div>
  );
};
