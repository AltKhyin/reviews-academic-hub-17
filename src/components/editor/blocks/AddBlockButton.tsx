
// ABOUTME: Add block button component for inserting new blocks between existing ones
// Provides drop zone and insertion functionality

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
}

export const AddBlockButton: React.FC<AddBlockButtonProps> = ({
  position,
  onAddBlock,
  isDropZone = false,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-2 transition-all duration-200",
        isDropZone && "bg-green-500/10 border border-green-500 rounded-lg"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDropZone ? (
        <div className="text-green-400 text-sm font-medium animate-pulse">
          ↓ Soltar bloco aqui ↓
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddBlock(position)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white border border-dashed border-gray-600 hover:border-gray-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloco
        </Button>
      )}
    </div>
  );
};
