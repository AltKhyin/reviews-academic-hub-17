
// ABOUTME: Advanced grid controls for dynamic column management and grid operations
// Provides UI for adding/removing columns, merging blocks, and grid manipulation

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Minus, 
  Merge, 
  Split, 
  ArrowLeftRight,
  Settings,
  Trash2,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridControlsProps {
  rowId: string;
  columns: number;
  hasBlocks: boolean;
  onAddColumn: () => void;
  onRemoveColumn: (columnIndex: number) => void;
  onMergeBlocks: (leftIndex: number, rightIndex: number) => void;
  onConvertToSingle: (mergeContent: boolean) => void;
  onReorderColumns: (fromIndex: number, toIndex: number) => void;
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
  className
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);

  const handleColumnSelect = (columnIndex: number) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnIndex)) {
        return prev.filter(i => i !== columnIndex);
      } else if (prev.length < 2) {
        return [...prev, columnIndex];
      } else {
        return [columnIndex]; // Replace selection if already 2 selected
      }
    });
  };

  const handleMergeSelected = () => {
    if (selectedColumns.length === 2) {
      const [left, right] = selectedColumns.sort((a, b) => a - b);
      onMergeBlocks(left, right);
      setSelectedColumns([]);
    }
  };

  const canMerge = selectedColumns.length === 2;
  const canRemoveColumn = columns > 1;
  const canAddColumn = columns < 6; // Reasonable limit

  return (
    <Card className={cn("grid-controls p-3", className)} style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" style={{ color: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Grid: {columns} colunas
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-6 w-6 p-0"
          style={{ color: '#9ca3af' }}
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      {/* Basic Controls */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddColumn}
          disabled={!canAddColumn}
          className="flex items-center gap-1"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: canAddColumn ? '#1a1a1a' : '#0f0f0f',
            color: canAddColumn ? '#ffffff' : '#6b7280'
          }}
          title="Adicionar coluna"
        >
          <Plus className="w-3 h-3" />
          Coluna
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveColumn(columns - 1)}
          disabled={!canRemoveColumn}
          className="flex items-center gap-1"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: canRemoveColumn ? '#1a1a1a' : '#0f0f0f',
            color: canRemoveColumn ? '#ffffff' : '#6b7280'
          }}
          title="Remover última coluna"
        >
          <Minus className="w-3 h-3" />
          Remover
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onConvertToSingle(false)}
          className="flex items-center gap-1"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
          title="Converter para coluna única"
        >
          <Split className="w-3 h-3" />
          Desfazer Grid
        </Button>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: '#2a2a2a' }}>
          {/* Column Selection */}
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: '#d1d5db' }}>
              Selecionar Colunas para Operações:
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: columns }, (_, index) => (
                <Button
                  key={index}
                  variant={selectedColumns.includes(index) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleColumnSelect(index)}
                  className="w-8 h-6 p-0 text-xs"
                  style={{
                    backgroundColor: selectedColumns.includes(index) ? '#3b82f6' : '#1a1a1a',
                    borderColor: '#2a2a2a',
                    color: selectedColumns.includes(index) ? '#ffffff' : '#d1d5db'
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Operations */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMergeSelected}
              disabled={!canMerge}
              className="flex items-center gap-1"
              style={{ 
                borderColor: '#2a2a2a',
                backgroundColor: canMerge ? '#1a1a1a' : '#0f0f0f',
                color: canMerge ? '#ffffff' : '#6b7280'
              }}
              title="Mesclar colunas selecionadas"
            >
              <Merge className="w-3 h-3" />
              Mesclar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onConvertToSingle(true)}
              className="flex items-center gap-1"
              style={{ 
                borderColor: '#2a2a2a',
                backgroundColor: '#1a1a1a',
                color: '#ffffff'
              }}
              title="Converter para coluna única mesclando conteúdo"
            >
              <ArrowLeftRight className="w-3 h-3" />
              Mesclar Tudo
            </Button>
          </div>

          {/* Column Removal */}
          {selectedColumns.length === 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRemoveColumn(selectedColumns[0]);
                  setSelectedColumns([]);
                }}
                disabled={!canRemoveColumn}
                className="flex items-center gap-1"
                style={{ 
                  borderColor: '#dc2626',
                  backgroundColor: '#1a1a1a',
                  color: '#ef4444'
                }}
                title={`Remover coluna ${selectedColumns[0] + 1}`}
              >
                <Trash2 className="w-3 h-3" />
                Remover Coluna {selectedColumns[0] + 1}
              </Button>
            </div>
          )}

          {/* Usage Hints */}
          <div className="text-xs" style={{ color: '#6b7280' }}>
            {selectedColumns.length === 0 && "Selecione colunas para operações avançadas"}
            {selectedColumns.length === 1 && "Selecione outra coluna para mesclar ou remover a atual"}
            {selectedColumns.length === 2 && "Clique em 'Mesclar' para combinar as colunas selecionadas"}
          </div>
        </div>
      )}
    </Card>
  );
};
