
// ABOUTME: Grid state management hook with string ID support
// Manages grid layout state and operations with proper type safety

import { useState, useCallback } from 'react';
import { Grid2DLayout, GridRow, GridCell, GridPosition } from '@/types/grid';
import { ReviewBlock } from '@/types/review';

interface GridStateResult {
  grid: Grid2DLayout;
  setGrid: React.Dispatch<React.SetStateAction<Grid2DLayout>>;
  addRow: (gridId: string, position?: number) => void;
  removeRow: (gridId: string, rowIndex: number) => void;
  addBlock: (gridId: string, position: GridPosition, block: ReviewBlock) => void;
  removeBlock: (gridId: string, position: GridPosition) => void;
  updateColumns: (gridId: string, columns: number) => void;
}

export const useGridState = (initialGrid?: Grid2DLayout): GridStateResult => {
  const [grid, setGrid] = useState<Grid2DLayout>(
    initialGrid || {
      id: `grid-${Date.now()}`,
      rows: [],
      columns: 2,
      gap: 16
    }
  );

  const addRow = useCallback((gridId: string, position?: number) => {
    if (gridId !== grid.id) return;
    
    setGrid(prev => {
      const newRow: GridRow = {
        id: `row-${Date.now()}`,
        cells: Array.from({ length: prev.columns }, (_, index) => ({
          id: `cell-${Date.now()}-${index}`,
          position: index,
          block: null
        }))
      };

      const newRows = [...prev.rows];
      const insertPosition = position !== undefined ? Math.max(0, Math.min(position, newRows.length)) : newRows.length;
      newRows.splice(insertPosition, 0, newRow);

      return {
        ...prev,
        rows: newRows
      };
    });
  }, [grid.id]);

  const removeRow = useCallback((gridId: string, rowIndex: number) => {
    if (gridId !== grid.id) return;
    
    setGrid(prev => {
      if (prev.rows.length <= 1) return prev; // Keep at least one row
      
      const newRows = prev.rows.filter((_, index) => index !== rowIndex);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [grid.id]);

  const addBlock = useCallback((gridId: string, position: GridPosition, block: ReviewBlock) => {
    if (gridId !== grid.id) return;
    
    setGrid(prev => {
      const newRows = prev.rows.map((row, rowIndex) => {
        if (rowIndex === position.row) {
          const newCells = row.cells.map(cell => {
            if (cell.position === position.column) {
              return {
                ...cell,
                block: {
                  id: block.id,
                  type: block.type,
                  content: block.content,
                  visible: block.visible,
                  sort_index: block.sort_index
                }
              };
            }
            return cell;
          });

          return {
            ...row,
            cells: newCells
          };
        }
        return row;
      });

      return {
        ...prev,
        rows: newRows
      };
    });
  }, [grid.id]);

  const removeBlock = useCallback((gridId: string, position: GridPosition) => {
    if (gridId !== grid.id) return;
    
    setGrid(prev => {
      const newRows = prev.rows.map((row, rowIndex) => {
        if (rowIndex === position.row) {
          const newCells = row.cells.map(cell => {
            if (cell.position === position.column) {
              return {
                ...cell,
                block: null
              };
            }
            return cell;
          });

          return {
            ...row,
            cells: newCells
          };
        }
        return row;
      });

      return {
        ...prev,
        rows: newRows
      };
    });
  }, [grid.id]);

  const updateColumns = useCallback((gridId: string, columns: number) => {
    if (gridId !== grid.id) return;
    
    setGrid(prev => {
      const newRows = prev.rows.map(row => {
        const currentCells = row.cells;
        const newCells: GridCell[] = [];

        // Add/remove cells based on column count
        for (let i = 0; i < columns; i++) {
          if (i < currentCells.length) {
            newCells.push({
              ...currentCells[i],
              position: i
            });
          } else {
            newCells.push({
              id: `cell-${Date.now()}-${i}`,
              position: i,
              block: null
            });
          }
        }

        return {
          ...row,
          cells: newCells
        };
      });

      return {
        ...prev,
        columns,
        rows: newRows
      };
    });
  }, [grid.id]);

  return {
    grid,
    setGrid,
    addRow,
    removeRow,
    addBlock,
    removeBlock,
    updateColumns
  };
};
