
// ABOUTME: Enhanced block content editor with proper drag-and-drop and visual feedback
// Provides seamless inline editing with compact controls and accurate edit state tracking

import React, { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
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

  // Compact six-dot drag handle component
  const CompactSixDotHandle = () => (
    <div
      className="six-dot-handle w-6 h-6 cursor-grab active:cursor-grabbing flex items-center justify-center rounded hover:bg-gray-600 transition-colors"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ backgroundColor: '#374151' }}
      title="Arrastar para reordenar"
    >
      <div className="grid grid-cols-2 gap-0.5">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 h-1 rounded-full" 
            style={{ backgroundColor: '#d1d5db' }}
          />
        ))}
      </div>
    </div>
  );

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
        borderColor: isActive ? '#3b82f6' : '#2a2a2a'
      }}
      onClick={handleBlockClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Compact Left-side Controls */}
      <div 
        className={cn(
          "block-controls absolute z-20",
          "flex flex-col gap-1",
          "transition-all duration-200",
          isActive ? "opacity-100 -left-12" : "opacity-0 group-hover:opacity-100 -left-12 group-hover:-left-12"
        )}
        style={{ top: '12px' }}
      >
        {/* Compact six-dot drag handle */}
        <CompactSixDotHandle />

        {/* Compact Up/Down movement buttons */}
        <div className="flex flex-col gap-0.5">
          {!isFirst && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMove(block.id, 'up');
              }}
              className="w-6 h-6 p-0 hover:bg-gray-600"
              style={{ backgroundColor: '#374151' }}
              title="Mover para cima"
            >
              <ArrowUp className="w-3 h-3" style={{ color: '#d1d5db' }} />
            </Button>
          )}

          {!isLast && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMove(block.id, 'down');
              }}
              className="w-6 h-6 p-0 hover:bg-gray-600"
              style={{ backgroundColor: '#374151' }}
              title="Mover para baixo"
            >
              <ArrowDown className="w-3 h-3" style={{ color: '#d1d5db' }} />
            </Button>
          )}
        </div>
      </div>

      {/* Compact Top Controls Bar */}
      <div 
        className={cn(
          "absolute z-20",
          "flex items-center justify-between px-2 py-1 rounded-t-lg",
          "transition-all duration-200",
          isActive ? "opacity-100 -top-8 left-0 right-0" : "opacity-0 group-hover:opacity-100 -top-8 group-hover:left-0 group-hover:right-0"
        )}
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="flex items-center gap-1">
          <div 
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {block.type.replace('_', ' ').toUpperCase()}
          </div>
          
          <div className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#374151', color: '#9ca3af' }}>
            #{block.id}
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Edit/Preview Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(!editMode);
            }}
            className="w-6 h-6 p-0 hover:bg-gray-700"
            style={{ backgroundColor: '#2a2a2a' }}
            title={editMode ? "Visualizar" : "Editar"}
          >
            {editMode ? (
              <Eye className="w-3 h-3" style={{ color: '#10b981' }} />
            ) : (
              <Edit3 className="w-3 h-3" style={{ color: '#f59e0b' }} />
            )}
          </Button>

          {/* Visibility Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVisibility();
            }}
            className="w-6 h-6 p-0 hover:bg-gray-700"
            style={{ backgroundColor: '#2a2a2a' }}
            title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
          >
            {block.visible ? (
              <Eye className="w-3 h-3" style={{ color: '#9ca3af' }} />
            ) : (
              <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />
            )}
          </Button>

          {/* Duplicate */}
          {onDuplicate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(block.id);
              }}
              className="w-6 h-6 p-0 hover:bg-gray-700"
              style={{ backgroundColor: '#2a2a2a' }}
              title="Duplicar bloco"
            >
              <Copy className="w-3 h-3" style={{ color: '#9ca3af' }} />
            </Button>
          )}

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="w-6 h-6 p-0 hover:bg-red-900 hover:text-red-400"
            style={{ backgroundColor: '#2a2a2a' }}
            title="Deletar bloco"
          >
            <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
          </Button>
        </div>
      </div>

      {/* Block Content */}
      <div className="relative">
        {editMode ? (
          /* Edit Mode - Inline Editing Enabled */
          <div className="p-4">
            <BlockRenderer
              block={block}
              onUpdate={handleBlockUpdate}
              readonly={false}
              className="block-content-edit"
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

      {/* Compact Mode Indicators */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {editMode && isActive && (
          <div 
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: '#10b981', color: '#ffffff' }}
          >
            EDITANDO
          </div>
        )}
        
        {!block.visible && (
          <div 
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
          >
            OCULTO
          </div>
        )}

        {isDragging && (
          <div 
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
          >
            MOVENDO
          </div>
        )}

        {draggedOver && (
          <div 
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: '#10b981', color: '#ffffff' }}
          >
            SOLTAR AQUI
          </div>
        )}
      </div>
    </div>
  );
};
