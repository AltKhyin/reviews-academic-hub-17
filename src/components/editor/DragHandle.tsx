
// ABOUTME: Enhanced drag handle component with improved visual feedback and accessibility
// Provides intuitive drag controls with better contrast and visual cues

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GripVertical, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragHandleProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isDragging?: boolean;
  className?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  isDragging = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={cn(
        "drag-handle-container flex items-center gap-1 transition-all duration-200",
        isDragging && "opacity-50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      {/* Main Drag Handle */}
      <div
        className={cn(
          "drag-handle cursor-grab active:cursor-grabbing transition-all duration-200",
          "flex items-center justify-center rounded border",
          isHovered ? "bg-gray-700 border-gray-500" : "bg-gray-800 border-gray-600"
        )}
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: isHovered ? '#374151' : '#1f2937',
          borderColor: isHovered ? '#6b7280' : '#4b5563'
        }}
        onMouseDown={() => setShowActions(false)}
        title="Arrastar bloco"
      >
        <GripVertical 
          className="w-3 h-3" 
          style={{ color: isHovered ? '#d1d5db' : '#9ca3af' }}
        />
      </div>

      {/* Action Buttons - Show on Hover */}
      {isHovered && (
        <div className="flex items-center gap-1 animate-in slide-in-from-left-2 duration-200">
          {/* Move Buttons */}
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-4 w-4 p-0 hover:bg-gray-700"
              style={{ 
                backgroundColor: 'transparent',
                opacity: canMoveUp ? 1 : 0.3
              }}
              title="Mover para cima"
            >
              <ChevronUp className="w-3 h-3" style={{ color: '#9ca3af' }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-4 w-4 p-0 hover:bg-gray-700"
              style={{ 
                backgroundColor: 'transparent',
                opacity: canMoveDown ? 1 : 0.3
              }}
              title="Mover para baixo"
            >
              <ChevronDown className="w-3 h-3" style={{ color: '#9ca3af' }} />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-6 w-6 p-0 hover:bg-gray-700"
              style={{ backgroundColor: 'transparent' }}
              title="Duplicar bloco"
            >
              <Copy className="w-3 h-3" style={{ color: '#3b82f6' }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 hover:bg-red-900"
              style={{ backgroundColor: 'transparent' }}
              title="Excluir bloco"
            >
              <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
            </Button>
          </div>
        </div>
      )}

      {/* Drag Preview Indicator */}
      {isDragging && (
        <div 
          className="drag-preview-indicator ml-2 px-2 py-1 rounded text-xs"
          style={{ 
            backgroundColor: '#3b82f6',
            color: '#ffffff'
          }}
        >
          Arrastando...
        </div>
      )}
    </div>
  );
};
