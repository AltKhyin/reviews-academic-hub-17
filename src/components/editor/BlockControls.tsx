// ABOUTME: Compact block controls for drag, visibility, and actions with up/down arrows
// Extracted from BlockContentEditor for better modularity

import React from 'react';
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

interface BlockControlsProps {
  blockId: string; // Changed from number to string
  isVisible: boolean;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  editMode: boolean;
  isDragging: boolean;
  onMove: (blockId: string, direction: 'up' | 'down') => void; // Changed from number to string
  onToggleVisibility: () => void;
  onToggleEditMode: () => void;
  onDuplicate?: (blockId: string) => void; // Changed from number to string
  onDelete: (blockId: string) => void; // Changed from number to string
}

export const BlockControls: React.FC<BlockControlsProps> = ({
  blockId,
  isVisible,
  isActive,
  isFirst,
  isLast,
  editMode,
  isDragging,
  onMove,
  onToggleVisibility,
  onToggleEditMode,
  onDuplicate,
  onDelete
}) => {
  // Compact six-dot drag handle component
  const CompactSixDotHandle = () => (
    <div
      className="six-dot-handle w-6 h-6 cursor-grab active:cursor-grabbing flex items-center justify-center rounded hover:bg-gray-600 transition-colors"
      draggable
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
    <>
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
                onMove(blockId, 'up');
              }}
              className="w-6 h-6 p-0 hover:bg-blue-600"
              style={{ backgroundColor: '#374151' }}
              title="Mover para cima"
            >
              <ArrowUp className="w-3 h-3" style={{ color: '#3b82f6' }} />
            </Button>
          )}

          {!isLast && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMove(blockId, 'down');
              }}
              className="w-6 h-6 p-0 hover:bg-blue-600"
              style={{ backgroundColor: '#374151' }}
              title="Mover para baixo"
            >
              <ArrowDown className="w-3 h-3" style={{ color: '#3b82f6' }} />
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
            #{blockId}
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Up Arrow - Quick Access */}
          {!isFirst && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMove(blockId, 'up');
              }}
              className="w-6 h-6 p-0 hover:bg-blue-700"
              style={{ backgroundColor: '#2a2a2a' }}
              title="Mover para cima"
            >
              <ArrowUp className="w-3 h-3" style={{ color: '#3b82f6' }} />
            </Button>
          )}

          {/* Down Arrow - Quick Access */}
          {!isLast && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMove(blockId, 'down');
              }}
              className="w-6 h-6 p-0 hover:bg-blue-700"
              style={{ backgroundColor: '#2a2a2a' }}
              title="Mover para baixo"
            >
              <ArrowDown className="w-3 h-3" style={{ color: '#3b82f6' }} />
            </Button>
          )}

          {/* Edit/Preview Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleEditMode();
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
              onToggleVisibility();
            }}
            className="w-6 h-6 p-0 hover:bg-gray-700"
            style={{ backgroundColor: '#2a2a2a' }}
            title={isVisible ? "Ocultar bloco" : "Mostrar bloco"}
          >
            {isVisible ? (
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
                onDuplicate(blockId);
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
              onDelete(blockId);
            }}
            className="w-6 h-6 p-0 hover:bg-red-900 hover:text-red-400"
            style={{ backgroundColor: '#2a2a2a' }}
            title="Deletar bloco"
          >
            <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
          </Button>
        </div>
      </div>
    </>
  );
};
