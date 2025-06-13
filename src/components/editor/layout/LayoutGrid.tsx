
// ABOUTME: Layout grid container managing multiple layout rows
// Fixed to use consistent string IDs and proper interfaces

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { LayoutRow, LayoutRowData } from './LayoutRow';
import { Button } from '@/components/ui/button';
import { Plus, Columns2, Columns3, Columns4 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutGridProps {
  rows: LayoutRowData[];
  onUpdateRow: (rowId: string, updates: Partial<LayoutRowData>) => void;
  onDeleteRow: (rowId: string) => void;
  onAddRow: (position?: number, columns?: number) => void;
  onAddBlock: (rowId: string, position: number, blockType: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (blockId: string) => void;
  readonly?: boolean;
  className?: string;
}

export const LayoutGrid: React.FC<LayoutGridProps> = ({
  rows,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onDeleteBlock,
  readonly = false,
  className
}) => {
  const handleAddRowWithColumns = (columns: number) => {
    onAddRow(undefined, columns);
  };

  if (readonly) {
    return (
      <div className={cn("layout-grid space-y-6", className)}>
        {rows.map((row) => (
          <LayoutRow
            key={row.id}
            row={row}
            onUpdateRow={onUpdateRow}
            onDeleteRow={onDeleteRow}
            onAddBlock={onAddBlock}
            onUpdateBlock={onUpdateBlock}
            onMoveBlock={onMoveBlock}
            onDeleteBlock={onDeleteBlock}
            readonly={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("layout-grid space-y-6", className)}>
      {/* Add Row Controls */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddRowWithColumns(1)}
          className="flex items-center gap-2"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <Plus className="w-4 h-4" />
          Linha Simples
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddRowWithColumns(2)}
          className="flex items-center gap-2"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <Columns2 className="w-4 h-4" />
          2 Colunas
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddRowWithColumns(3)}
          className="flex items-center gap-2"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <Columns3 className="w-4 h-4" />
          3 Colunas
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddRowWithColumns(4)}
          className="flex items-center gap-2"
          style={{ 
            borderColor: '#2a2a2a',
            backgroundColor: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <Columns4 className="w-4 h-4" />
          4 Colunas
        </Button>
      </div>

      {/* Layout Rows */}
      {rows.map((row) => (
        <LayoutRow
          key={row.id}
          row={row}
          onUpdateRow={onUpdateRow}
          onDeleteRow={onDeleteRow}
          onAddBlock={onAddBlock}
          onUpdateBlock={onUpdateBlock}
          onMoveBlock={onMoveBlock}
          onDeleteBlock={onDeleteBlock}
          readonly={false}
        />
      ))}

      {/* Empty State */}
      {rows.length === 0 && (
        <div 
          className="border-2 border-dashed rounded-lg p-12 text-center"
          style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
        >
          <div className="text-4xl mb-4">📐</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
            Comece Criando uma Linha
          </h3>
          <p className="mb-6" style={{ color: '#d1d5db' }}>
            Organize seus blocos em linhas com múltiplas colunas para layouts mais dinâmicos
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleAddRowWithColumns(1)}
              style={{ 
                borderColor: '#3b82f6',
                color: '#3b82f6'
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Linha
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
