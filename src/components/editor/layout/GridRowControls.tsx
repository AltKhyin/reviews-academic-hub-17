
// ABOUTME: Row controls for 2D grid management
// Provides add/remove row functionality with visual feedback

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GridRowControlsProps {
  rowIndex: number;
  totalRows: number;
  onAddRowAbove: (rowIndex: number) => void;
  onAddRowBelow: (rowIndex: number) => void;
  onRemoveRow: (rowIndex: number) => void;
  compact?: boolean;
  className?: string;
}

export const GridRowControls: React.FC<GridRowControlsProps> = ({
  rowIndex,
  totalRows,
  onAddRowAbove,
  onAddRowBelow,
  onRemoveRow,
  compact = false,
  className
}) => {

  const handleAddRowAbove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddRowAbove(rowIndex);
  };

  const handleAddRowBelow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddRowBelow(rowIndex);
  };

  const handleRemoveRow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (totalRows <= 1) {
      console.warn('Cannot remove the last row');
      return;
    }
    
    if (window.confirm('Remover esta linha? Todos os blocos nela serão excluídos.')) {
      onRemoveRow(rowIndex);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex flex-col items-center gap-1 py-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="center" 
            className="bg-gray-800 border-gray-700"
          >
            <DropdownMenuItem 
              onClick={handleAddRowAbove}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Plus className="w-3 h-3 mr-2" />
              Adicionar linha acima
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleAddRowBelow}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Plus className="w-3 h-3 mr-2" />
              Adicionar linha abaixo
            </DropdownMenuItem>
            {totalRows > 1 && (
              <DropdownMenuItem 
                onClick={handleRemoveRow}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Minus className="w-3 h-3 mr-2" />
                Remover linha
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Row indicator */}
        <div className="text-xs text-gray-500 font-mono">
          {rowIndex + 1}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-700", className)}>
      <span className="text-xs text-gray-400 font-mono">
        Linha {rowIndex + 1}
      </span>
      
      <Button
        onClick={handleAddRowAbove}
        size="sm"
        variant="ghost"
        className="w-8 h-8 p-0 text-gray-400 hover:text-white"
        title="Adicionar linha acima"
      >
        <Plus className="w-3 h-3" />
      </Button>
      
      <Button
        onClick={handleAddRowBelow}
        size="sm"
        variant="ghost"
        className="w-8 h-8 p-0 text-gray-400 hover:text-white"
        title="Adicionar linha abaixo"
      >
        <Plus className="w-3 h-3" />
      </Button>
      
      {totalRows > 1 && (
        <Button
          onClick={handleRemoveRow}
          size="sm"
          variant="ghost"
          className="w-8 h-8 p-0 text-red-400 hover:text-red-300"
          title="Remover linha"
        >
          <Minus className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};
