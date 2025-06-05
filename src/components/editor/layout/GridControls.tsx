
// ABOUTME: Enhanced grid controls with 2D grid conversion support
// Provides buttons and controls for both 1D and 2D grid operations

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  Plus, 
  Minus, 
  ArrowLeftRight, 
  ArrowUpDown,
  Combine,
  Split,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridControlsProps {
  rowId: string;
  columns: number;
  hasBlocks: boolean;
  onAddColumn: (e?: React.MouseEvent) => void;
  onRemoveColumn: (columnIndex: number, e?: React.MouseEvent) => void;
  onMergeBlocks: (leftIndex: number, rightIndex: number, e?: React.MouseEvent) => void;
  onConvertToSingle: (mergeContent: boolean, e?: React.MouseEvent) => void;
  onReorderColumns: (fromIndex: number, toIndex: number) => void;
  onConvertTo2DGrid?: (e?: React.MouseEvent) => void;
  className?: string;
}

export const GridControls: React.FC<GridControlsProps> = ({
  rowId,
  columns,
  hasBlocks,
  onAddColumn,
  onRemoveColumn,
  onMergeBlocks,
  onConvertToSingle,
  onReorderColumns,
  onConvertTo2DGrid,
  className
}) => {
  const canRemoveColumn = columns > 1;
  const canMergeBlocks = columns > 1 && hasBlocks;

  return (
    <div className={cn("flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border", className)} style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-3">
        {/* Grid Info */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Grid3X3 className="w-4 h-4" />
          <span>{columns} colunas</span>
        </div>
        
        {/* Column Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddColumn}
            className="h-7 px-2 text-xs bg-blue-800/50 border border-blue-600/50 hover:bg-blue-700"
            title="Adicionar coluna"
          >
            <Plus className="w-3 h-3 mr-1" />
            Coluna
          </Button>
          
          {canRemoveColumn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onRemoveColumn(columns - 1, e)}
              className="h-7 px-2 text-xs bg-red-800/50 border border-red-600/50 hover:bg-red-700"
              title="Remover última coluna"
            >
              <Minus className="w-3 h-3 mr-1" />
              Coluna
            </Button>
          )}
        </div>

        {/* Advanced Controls */}
        <div className="flex items-center gap-1">
          {canMergeBlocks && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onMergeBlocks(0, 1, e)}
              className="h-7 px-2 text-xs bg-purple-800/50 border border-purple-600/50 hover:bg-purple-700"
              title="Mesclar primeiras duas colunas"
            >
              <Combine className="w-3 h-3 mr-1" />
              Mesclar
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onConvertToSingle(false, e)}
            className="h-7 px-2 text-xs bg-orange-800/50 border border-orange-600/50 hover:bg-orange-700"
            title="Converter para bloco único"
          >
            <Split className="w-3 h-3 mr-1" />
            Dividir
          </Button>

          {/* New: Convert to 2D Grid */}
          {onConvertTo2DGrid && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onConvertTo2DGrid}
              className="h-7 px-2 text-xs bg-green-800/50 border border-green-600/50 hover:bg-green-700"
              title="Converter para grid 2D (vertical)"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              2D Grid
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Arraste os divisores para redimensionar</span>
      </div>
    </div>
  );
};
