
// ABOUTME: Enhanced block control buttons with 2D grid conversion support
// Provides comprehensive block manipulation options including 2D grid conversion

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Copy, 
  EyeOff, 
  Eye, 
  Grip,
  Columns2,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockControlsProps {
  block: ReviewBlock;
  isActive: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onConvertToGrid: () => void;
  onConvertTo2DGrid?: () => void;
  onToggleVisibility: () => void;
  className?: string;
}

export const BlockControls: React.FC<BlockControlsProps> = ({
  block,
  isActive,
  onDelete,
  onDuplicate,
  onConvertToGrid,
  onConvertTo2DGrid,
  onToggleVisibility,
  className
}) => {
  return (
    <div className={cn(
      "absolute -top-2 -right-2 flex gap-1 transition-opacity z-10",
      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      className
    )}>
      {/* Drag Handle */}
      <Button
        variant="ghost"
        size="sm"
        className="w-6 h-6 p-0 bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
        title="Arrastar bloco"
      >
        <Grip className="w-3 h-3" />
      </Button>

      {/* Convert to 1D Grid */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onConvertToGrid();
        }}
        className="w-6 h-6 p-0 bg-blue-800/80 hover:bg-blue-700/80 text-blue-400 hover:text-white"
        title="Converter para grid horizontal"
      >
        <Columns2 className="w-3 h-3" />
      </Button>

      {/* Convert to 2D Grid */}
      {onConvertTo2DGrid && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onConvertTo2DGrid();
          }}
          className="w-6 h-6 p-0 bg-purple-800/80 hover:bg-purple-700/80 text-purple-400 hover:text-white"
          title="Converter para grid 2D"
        >
          <Grid3X3 className="w-3 h-3" />
        </Button>
      )}

      {/* Toggle Visibility */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="w-6 h-6 p-0 bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white"
        title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
      >
        {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      </Button>

      {/* Duplicate */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="w-6 h-6 p-0 bg-green-800/80 hover:bg-green-700/80 text-green-400 hover:text-white"
        title="Duplicar bloco"
      >
        <Copy className="w-3 h-3" />
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-6 h-6 p-0 bg-red-800/80 hover:bg-red-700/80 text-red-400 hover:text-white"
        title="Remover bloco"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};
