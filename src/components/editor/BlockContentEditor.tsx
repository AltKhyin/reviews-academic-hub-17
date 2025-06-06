
// ABOUTME: Simplified block content editor with extracted components
// Main container for block editing with modular controls

import React, { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { BlockControls } from './BlockControls';
import { BlockStatusIndicators } from './BlockStatusIndicators';
import { cn } from '@/lib/utils';

interface BlockContentEditorProps {
  block: ReviewBlock;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (blockId: number) => void;
  onUpdate: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDelete: (blockId: number) => void;
  onDuplicate?: (blockId: number) => void;
  onMove: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
}

export const BlockContentEditor: React.FC<BlockContentEditorProps> = ({
  block,
  isActive,
  isFirst,
  isLast,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onAddBlock
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleBlockClick = useCallback((e: React.MouseEvent) => {
    // Don't select if clicking on interactive elements
    const target = e.target as Element;
    const isInteractiveElement = target.closest('.inline-text-editor-display, .inline-rich-editor-display, input, textarea, button, select, .block-controls');
    
    if (!isInteractiveElement) {
      e.stopPropagation();
      onSelect(block.id);
    }
  }, [block.id, onSelect]);

  const handleBlockUpdate = useCallback((updates: Partial<ReviewBlock>) => {
    onUpdate(block.id, updates);
  }, [onUpdate, block.id]);

  const handleToggleVisibility = useCallback(() => {
    onUpdate(block.id, { visible: !block.visible });
  }, [block.id, block.visible, onUpdate]);

  const handleToggleEditMode = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode]);

  // Enhanced drag handlers with proper functionality
  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Create drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(0deg)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  }, [block.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set draggedOver to false if we're actually leaving the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const draggedBlockId = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (draggedBlockId !== block.id) {
      // Determine direction based on drop position
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const direction = e.clientY < midpoint ? 'up' : 'down';
      
      // Move the dragged block relative to this block
      onMove(draggedBlockId, direction);
    }
    
    setDraggedOver(false);
  }, [block.id, onMove]);

  return (
    <div
      className={cn(
        "block-content-editor group relative",
        "border rounded-lg transition-all duration-200",
        isActive && "ring-2 ring-blue-500 ring-opacity-50 shadow-lg",
        isDragging && "opacity-50",
        draggedOver && "ring-2 ring-green-500 ring-opacity-50",
        !block.visible && "opacity-60"
      )}
      style={{
        backgroundColor: '#1a1a1a',
        borderColor: isActive ? '#3b82f6' : '#2a2a2a',
        overflow: 'visible !important',
        position: 'relative'
      }}
      onClick={handleBlockClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <BlockControls
        blockId={block.id}
        isVisible={block.visible}
        isActive={isActive}
        isFirst={isFirst}
        isLast={isLast}
        editMode={editMode}
        isDragging={isDragging}
        onMove={onMove}
        onToggleVisibility={handleToggleVisibility}
        onToggleEditMode={handleToggleEditMode}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />

      {/* Block Content */}
      <div className="relative" style={{ overflow: 'visible !important' }}>
        {editMode ? (
          /* Edit Mode - Inline Editing Enabled */
          <div className="p-4" style={{ overflow: 'visible !important' }}>
            <BlockRenderer
              block={block}
              onUpdate={handleBlockUpdate}
              readonly={false}
              className="block-content-edit"
              style={{ overflow: 'visible !important' }}
            />
          </div>
        ) : (
          /* Preview Mode - Read Only */
          <div className="p-4">
            <BlockRenderer
              block={block}
              readonly={true}
              className="block-content-preview"
            />
          </div>
        )}
      </div>

      <BlockStatusIndicators
        editMode={editMode}
        isActive={isActive}
        isVisible={block.visible}
        isDragging={isDragging}
        draggedOver={draggedOver}
      />
    </div>
  );
};
