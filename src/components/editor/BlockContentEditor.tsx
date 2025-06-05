
// ABOUTME: Unified block content editor that combines rendering and editing
// Provides seamless inline editing experience within the block editor interface

import React, { useState, useCallback } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GripVertical, 
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
  const [editMode, setEditMode] = useState(true); // Start in edit mode for better UX

  const handleBlockClick = useCallback((e: React.MouseEvent) => {
    // Don't interfere with inline editing - only select if clicking the wrapper
    if (e.target === e.currentTarget || (e.target as Element).closest('.block-controls')) {
      e.stopPropagation();
      onSelect(block.id);
    }
  }, [block.id, onSelect]);

  const handleBlockUpdate = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    onUpdate(blockId, updates);
  }, [onUpdate]);

  const handleToggleVisibility = useCallback(() => {
    onUpdate(block.id, { visible: !block.visible });
  }, [block.id, block.visible, onUpdate]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  }, [block.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className={cn(
        "block-content-editor group relative",
        "border rounded-lg transition-all duration-200",
        isActive && "ring-2 ring-blue-500 ring-opacity-50",
        isDragging && "opacity-50",
        !block.visible && "opacity-60"
      )}
      style={{
        backgroundColor: '#1a1a1a',
        borderColor: isActive ? '#3b82f6' : '#2a2a2a'
      }}
      onClick={handleBlockClick}
    >
      {/* Block Controls Toolbar */}
      <div 
        className={cn(
          "block-controls absolute -left-12 top-0 z-10",
          "flex flex-col gap-1 opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200",
          isActive && "opacity-100"
        )}
      >
        {/* Drag Handle */}
        <Button
          size="sm"
          variant="ghost"
          className="w-8 h-8 p-0 cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ backgroundColor: '#2a2a2a' }}
        >
          <GripVertical className="w-4 h-4" style={{ color: '#9ca3af' }} />
        </Button>

        {/* Move Up */}
        {!isFirst && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMove(block.id, 'up')}
            className="w-8 h-8 p-0"
            style={{ backgroundColor: '#2a2a2a' }}
          >
            <ArrowUp className="w-3 h-3" style={{ color: '#9ca3af' }} />
          </Button>
        )}

        {/* Move Down */}
        {!isLast && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMove(block.id, 'down')}
            className="w-8 h-8 p-0"
            style={{ backgroundColor: '#2a2a2a' }}
          >
            <ArrowDown className="w-3 h-3" style={{ color: '#9ca3af' }} />
          </Button>
        )}
      </div>

      {/* Top Controls Bar */}
      <div 
        className={cn(
          "absolute -top-10 left-0 right-0 z-20",
          "flex items-center justify-between px-2",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isActive && "opacity-100"
        )}
      >
        <div className="flex items-center gap-1">
          <div 
            className="text-xs px-2 py-1 rounded"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {block.type.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Edit/Preview Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditMode(!editMode)}
            className="w-8 h-8 p-0"
            style={{ backgroundColor: '#2a2a2a' }}
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
            onClick={handleToggleVisibility}
            className="w-8 h-8 p-0"
            style={{ backgroundColor: '#2a2a2a' }}
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
              onClick={() => onDuplicate(block.id)}
              className="w-8 h-8 p-0"
              style={{ backgroundColor: '#2a2a2a' }}
            >
              <Copy className="w-3 h-3" style={{ color: '#9ca3af' }} />
            </Button>
          )}

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(block.id)}
            className="w-8 h-8 p-0"
            style={{ backgroundColor: '#2a2a2a' }}
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

      {/* Edit Mode Indicator */}
      {editMode && isActive && (
        <div 
          className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded"
          style={{ backgroundColor: '#10b981', color: '#ffffff' }}
        >
          Editing
        </div>
      )}
    </div>
  );
};
