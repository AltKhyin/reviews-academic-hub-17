
// ABOUTME: Enhanced single block component with 2D grid conversion support
// Handles individual block rendering with comprehensive grid conversion options

import React, { useCallback, useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { BlockControls } from './BlockControls';
import { AddBlockButton } from './AddBlockButton';
import { cn } from '@/lib/utils';

interface DragState {
  draggedBlockId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
  draggedFromRowId: string | null;
  dropTargetType: 'grid' | 'single' | 'merge' | null;
}

interface SingleBlockProps {
  block: ReviewBlock;
  globalIndex: number;
  activeBlockId: string | null;
  dragState: DragState;
  onActiveBlockChange: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onConvertToGrid: (blockId: string, columns: number) => void;
  onConvertTo2DGrid?: (blockId: string, columns: number, rows: number) => void;
  onAddBlockBetween: (position: number, type?: string) => void;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, targetRowId: string, targetPosition?: number, targetType?: 'grid' | 'single' | 'merge') => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetRowId: string, targetPosition?: number, dropType?: 'grid' | 'single' | 'merge') => void;
}

export const SingleBlock: React.FC<SingleBlockProps> = ({
  block,
  globalIndex,
  activeBlockId,
  dragState,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onConvertToGrid,
  onConvertTo2DGrid,
  onAddBlockBetween,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [showGridConversion, setShowGridConversion] = useState(false);
  const [show2DGridConversion, setShow2DGridConversion] = useState(false);

  const isActive = activeBlockId === block.id;
  const isDragging = dragState.draggedBlockId === block.id;
  const isDropTarget = dragState.dragOverRowId === `single-${block.id}`;

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as Element;
    
    const isInteractiveElement = target.closest(
      '.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select, [contenteditable], .grid-controls'
    );
    
    if (!isInteractiveElement) {
      e.stopPropagation();
      onActiveBlockChange(isActive ? null : block.id);
    }
  }, [isActive, onActiveBlockChange, block.id]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    onDragStart(e, block.id);
  }, [onDragStart, block.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    onDragOver(e, `single-${block.id}`, 0, 'single');
  }, [onDragOver, block.id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    onDrop(e, `single-${block.id}`, 0, 'merge');
  }, [onDrop, block.id]);

  const createBlockUpdateWrapper = useCallback((updates: Partial<ReviewBlock>) => {
    onUpdateBlock(block.id, updates);
  }, [onUpdateBlock, block.id]);

  const handleConvertToGrid = useCallback((columns: number) => {
    onConvertToGrid(block.id, columns);
    setShowGridConversion(false);
  }, [onConvertToGrid, block.id]);

  const handleConvertTo2DGrid = useCallback((columns: number, rows: number) => {
    if (onConvertTo2DGrid) {
      onConvertTo2DGrid(block.id, columns, rows);
    }
    setShow2DGridConversion(false);
  }, [onConvertTo2DGrid, block.id]);

  return (
    <div className="single-block-container mx-2 mb-6">
      {/* Add Block Above */}
      <AddBlockButton
        position={globalIndex}
        onAddBlock={onAddBlockBetween}
        isDropZone={isDropTarget}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
      />

      {/* Main Block */}
      <div
        className={cn(
          "relative group transition-all duration-200 cursor-pointer rounded-lg",
          isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
          !block.visible && "opacity-50",
          isDragging && "opacity-30 scale-95"
        )}
        style={{ 
          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          borderColor: isActive ? '#3b82f6' : 'transparent'
        }}
        onClick={handleClick}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
      >
        {/* Block Controls */}
        <BlockControls
          block={block}
          isActive={isActive}
          onDelete={() => onDeleteBlock(block.id)}
          onDuplicate={() => onDuplicateBlock(block.id)}
          onConvertToGrid={() => setShowGridConversion(true)}
          onConvertTo2DGrid={() => setShow2DGridConversion(true)}
          onToggleVisibility={() => onUpdateBlock(block.id, { visible: !block.visible })}
        />

        {/* Grid Conversion Options */}
        {showGridConversion && (
          <div className="absolute top-12 right-2 z-20 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-300 mb-2">Converter para Grid 1D:</div>
            <div className="flex gap-2">
              {[2, 3, 4].map(cols => (
                <button
                  key={cols}
                  onClick={() => handleConvertToGrid(cols)}
                  className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white"
                >
                  {cols} cols
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGridConversion(false)}
              className="mt-2 text-xs text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* 2D Grid Conversion Options */}
        {show2DGridConversion && (
          <div className="absolute top-12 right-2 z-20 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-300 mb-2">Converter para Grid 2D:</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { cols: 2, rows: 2, label: '2×2' },
                { cols: 3, rows: 2, label: '3×2' },
                { cols: 2, rows: 3, label: '2×3' },
                { cols: 3, rows: 3, label: '3×3' }
              ].map(({ cols, rows, label }) => (
                <button
                  key={label}
                  onClick={() => handleConvertTo2DGrid(cols, rows)}
                  className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded text-white"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShow2DGridConversion(false)}
              className="mt-2 text-xs text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Block Content */}
        <div className="p-4">
          <BlockRenderer
            block={block}
            onUpdate={createBlockUpdateWrapper}
            readonly={false}
          />
        </div>

        {/* Drop Indicator */}
        {isDropTarget && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg bg-green-500/5 flex items-center justify-center pointer-events-none">
            <div className="text-green-400 text-sm font-medium animate-pulse">
              ↓ Soltar bloco aqui ↓
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
