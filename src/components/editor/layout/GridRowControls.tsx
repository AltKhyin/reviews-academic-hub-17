
// ABOUTME: Row control buttons for 2D grid management
// Provides add/remove row functionality with compact design

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn(
      "flex flex-col items-center gap-1 text-xs",
      compact ? "opacity-60 hover:opacity-100" : "",
      className
    )}>
      {/* Add Row Above */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddRowAbove(rowIndex)}
        className="w-6 h-6 p-0 text-gray-500 hover:text-green-400 hover:bg-green-500/20"
        title="Adicionar linha acima"
      >
        <Plus className="w-3 h-3" />
      </Button>
      
      {/* Row Index */}
      <div className="text-gray-400 font-mono text-xs min-w-[16px] text-center">
        {rowIndex + 1}
      </div>
      
      {/* Remove Row (only if more than 1 row) */}
      {totalRows > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveRow(rowIndex)}
          className="w-6 h-6 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/20"
          title="Remover linha"
        >
          <Minus className="w-3 h-3" />
        </Button>
      )}
      
      {/* Add Row Below */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddRowBelow(rowIndex)}
        className="w-6 h-6 p-0 text-gray-500 hover:text-green-400 hover:bg-green-500/20"
        title="Adicionar linha abaixo"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
};
