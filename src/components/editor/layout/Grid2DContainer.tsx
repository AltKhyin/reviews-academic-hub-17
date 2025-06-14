
// ABOUTME: Enhanced 2D grid container with proper string ID support and event handling
// Manages complete 2D grid layouts with drag and drop functionality

import React, { useState, useCallback } from 'react';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { Grid2DRow } from './Grid2DRow';
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

interface Grid2DContainerProps {
  layout: Grid2DLayout;
  activeBlockId: string | null;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (gridId: string, position: GridPosition) => void;
  onAddRowAbove: (gridId: string, rowIndex: number) => void;
  onAddRowBelow: (gridId: string, rowIndex: number) => void;
  onRemoveRow: (gridId: string, rowIndex: number) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void;
  onAddBlockAtPosition: (type: any, position?: number) => void;
  readonly?: boolean;
}

const defaultDragState: DragState = {
  draggedBlockId: null,
  dragOverRowId: null,
  dragOverPosition: null,
  isDragging: false,
  draggedFromRowId: null,
  dropTargetType: null,
};

export const Grid2DContainer: React.FC<Grid2DContainerProps> = ({
  layout,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  onMove,
  onAddBlockAtPosition,
  readonly = false
}) => {
  const [dragState, setDragState] = useState<DragState>(defaultDragState);

  const handleDragOver = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: targetRowId,
      dragOverPosition: targetPosition || null,
      dropTargetType: targetType || null
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    setDragState(prev => ({
      ...prev,
      dragOverRowId: null,
      dragOverPosition: null,
      dropTargetType: null
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle drop logic here
    console.log('Drop:', { targetRowId, targetPosition, dropType, dragState });
    
    setDragState(defaultDragState);
  }, [dragState]);

  // Fixed callback to match expected signature
  const handleAddBlockToGrid = useCallback((gridId: string, position: GridPosition) => {
    onAddBlock(gridId, position);
  }, [onAddBlock]);

  const canRemoveRow = layout.rows.length > 1;

  if (readonly) {
    return (
      <div className="grid-2d-container">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${layout.columns}, 1fr)` }}>
          {layout.rows.map((row, rowIndex) => (
            <Grid2DRow
              key={row.id}
              row={row}
              rowIndex={rowIndex}
              gridId={layout.id}
              columns={layout.columns}
              activeBlockId={null}
              onActiveBlockChange={() => {}}
              onUpdateBlock={() => {}}
              onDeleteBlock={() => {}}
              onAddBlock={handleAddBlockToGrid}
              onAddRowAbove={() => {}}
              onAddRowBelow={() => {}}
              onRemoveRow={() => {}}
              onMove={() => {}}
              onAddBlockAtPosition={() => {}}
              dragState={defaultDragState}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onDrop={() => {}}
              canRemoveRow={false}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid-2d-container border border-gray-600 rounded-lg p-4 mb-6" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Container Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-gray-300">
            Grid 2D: {layout.columns} colunas × {layout.rows.length} linhas
          </h3>
          <span className="text-xs text-gray-500">#{layout.id}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-gray-300"
            title="Configurações do Grid"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${layout.columns}, 1fr)` }}>
        {layout.rows.map((row, rowIndex) => (
          <Grid2DRow
            key={row.id}
            row={row}
            rowIndex={rowIndex}
            gridId={layout.id}
            columns={layout.columns}
            activeBlockId={activeBlockId}
            onActiveBlockChange={onActiveBlockChange}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onAddBlock={handleAddBlockToGrid}
            onAddRowAbove={onAddRowAbove}
            onAddRowBelow={onAddRowBelow}
            onRemoveRow={onRemoveRow}
            onMove={onMove}
            onAddBlockAtPosition={onAddBlockAtPosition}
            dragState={dragState}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            canRemoveRow={canRemoveRow}
          />
        ))}
      </div>

      {/* Grid Stats */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          Total de células: {layout.rows.length * layout.columns}
        </div>
        <div className="text-xs text-gray-500">
          Células preenchidas: {layout.rows.reduce((acc, row) => acc + row.cells.filter(cell => cell.block).length, 0)}
        </div>
      </div>
    </div>
  );
};
