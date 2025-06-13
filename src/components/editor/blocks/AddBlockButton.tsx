
// ABOUTME: Add block button component with drop zone functionality
// Provides interface for adding blocks between existing blocks

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddBlockButtonProps {
  position: number;
  onAddBlock: (position: number, type?: string) => void;
  isDropZone?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

export const AddBlockButton: React.FC<AddBlockButtonProps> = ({
  position,
  onAddBlock,
  isDropZone = false,
  onDragOver,
  onDragLeave,
  onDrop,
  className
}) => {
  return (
    <div 
      className={cn(
        "flex justify-center py-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity",
        isDropZone && "opacity-100 bg-green-500/10 border border-green-500/50 rounded-lg",
        className
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDropZone ? (
        <div className="text-green-400 text-sm font-medium animate-pulse py-2">
          ↓ Soltar bloco aqui ↓
        </div>
      ) : (
        <Button
          onClick={() => onAddBlock(position)}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 opacity-60 hover:opacity-100"
        >
          <Plus className="w-3 h-3 mr-1" />
          Adicionar bloco
        </Button>
      )}
    </div>
  );
};
