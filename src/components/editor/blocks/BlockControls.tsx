
// ABOUTME: Block controls component for editor actions and settings
// Provides editing controls for individual blocks

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Grid3X3, 
  Grid2X2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockControlsProps {
  block: ReviewBlock;
  isActive: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onConvertToGrid: () => void;
  onConvertTo2DGrid: () => void;
  onToggleVisibility: () => void;
}

export const BlockControls: React.FC<BlockControlsProps> = ({
  block,
  isActive,
  onDelete,
  onDuplicate,
  onConvertToGrid,
  onConvertTo2DGrid,
  onToggleVisibility
}) => {
  return (
    <div className={cn(
      "absolute -top-2 -right-2 z-10 flex gap-1 transition-opacity",
      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="h-6 w-6 p-0 bg-gray-800 border border-gray-600 hover:bg-gray-700"
        title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
      >
        {block.visible ? (
          <Eye className="w-3 h-3" />
        ) : (
          <EyeOff className="w-3 h-3" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="h-6 w-6 p-0 bg-blue-800 border border-blue-600 hover:bg-blue-700"
        title="Duplicar bloco"
      >
        <Copy className="w-3 h-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onConvertToGrid();
        }}
        className="h-6 w-6 p-0 bg-purple-800 border border-purple-600 hover:bg-purple-700"
        title="Converter para grid 1D"
      >
        <Grid3X3 className="w-3 h-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onConvertTo2DGrid();
        }}
        className="h-6 w-6 p-0 bg-green-800 border border-green-600 hover:bg-green-700"
        title="Converter para grid 2D"
      >
        <Grid2X2 className="w-3 h-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
        title="Remover bloco"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};
