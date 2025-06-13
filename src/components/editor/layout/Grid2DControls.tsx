
// ABOUTME: Controls component for 2D grid layout management
// Provides buttons and controls for grid operations

import React from 'react';
import { Grid2DLayout } from '@/types/grid';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Grid2DControlsProps {
  grid: Grid2DLayout;
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onUpdateGridLayout?: (gridId: string, updates: any) => void;
  className?: string;
}

export const Grid2DControls: React.FC<Grid2DControlsProps> = ({
  grid,
  onAddRowAbove,
  onAddRowBelow,
  onUpdateGridLayout,
  className
}) => {
  const handleGapChange = (newGap: number) => {
    if (onUpdateGridLayout) {
      onUpdateGridLayout(grid.id, { gap: newGap });
    }
  };

  return (
    <div className={cn("flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border", className)} style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-3">
        {/* Grid Info */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Grid3X3 className="w-4 h-4" />
          <span>{grid.columns} × {grid.rows.length}</span>
        </div>
        
        {/* Row Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddRowAbove}
            className="h-7 px-2 text-xs bg-blue-800/50 border border-blue-600/50 hover:bg-blue-700"
            title="Adicionar linha acima"
          >
            <Plus className="w-3 h-3 mr-1" />
            Linha Acima
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddRowBelow}
            className="h-7 px-2 text-xs bg-blue-800/50 border border-blue-600/50 hover:bg-blue-700"
            title="Adicionar linha abaixo"
          >
            <Plus className="w-3 h-3 mr-1" />
            Linha Abaixo
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Gap Control */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-400">Espaçamento:</label>
          <select
            value={grid.gap}
            onChange={(e) => handleGapChange(parseInt(e.target.value))}
            className="h-7 px-2 text-xs bg-gray-800 border border-gray-600 rounded"
            style={{ color: '#ffffff' }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
        </div>
      </div>
    </div>
  );
};
