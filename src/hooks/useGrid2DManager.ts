
// ABOUTME: Grid 2D manager with proper type safety and layout management
import { useState, useCallback, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { Grid2DLayout, GridPosition, GridCell, GridRow } from '@/types/grid';
import { sanitizeBlockType } from '@/utils/typeGuards';

interface UseGrid2DManagerProps {
  initialLayout?: Grid2DLayout;
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
}

export const useGrid2DManager = ({
  initialLayout,
  blocks,
  onUpdateBlock
}: UseGrid2DManagerProps) => {
  
  const [layout, setLayout] = useState<Grid2DLayout | null>(initialLayout || null);

  const updateLayout = useCallback((newLayout: Partial<Grid2DLayout>) => {
    setLayout(prev => prev ? { ...prev, ...newLayout } : null);
  }, []);

  const updateRowColumnCount = useCallback((rowIndex: number, columns: number) => {
    if (!layout) return;

    const newRows = [...layout.rows];
    if (newRows[rowIndex]) {
      // Ensure proper cell structure with all required properties
      const currentCells = newRows[rowIndex].cells || [];
      const newCells: GridCell[] = [];
      
      for (let i = 0; i < columns; i++) {
        newCells.push({
          id: currentCells[i]?.id || `cell-${rowIndex}-${i}`,
          row: rowIndex,
          column: i,
          position: i, // Add required position property
          block: currentCells[i]?.block || null
        });
      }

      newRows[rowIndex] = {
        ...newRows[rowIndex],
        cells: newCells
      };

      setLayout(prev => prev ? { ...prev, rows: newRows } : null);
    }
  }, [layout]);

  const updateColumnWidths = useCallback((widths: number[]) => {
    if (!layout) return;
    // Grid2DLayout doesn't have columnWidths property, update through row metadata
    const newRows = layout.rows.map(row => ({
      ...row,
      metadata: { ...row.metadata, columnWidths: widths }
    }));
    
    setLayout(prev => prev ? { ...prev, rows: newRows } : null);
  }, [layout]);

  const updateRowHeights = useCallback((heights: number[]) => {
    if (!layout) return;
    // Grid2DLayout doesn't have rowHeights property, update through row metadata
    const newRows = layout.rows.map((row, index) => ({
      ...row,
      metadata: { ...row.metadata, height: heights[index] }
    }));
    
    setLayout(prev => prev ? { ...prev, rows: newRows } : null);
  }, [layout]);

  const addBlockToCell = useCallback((position: GridPosition, block: ReviewBlock) => {
    if (!layout) return;

    const newRows = [...layout.rows];
    const row = newRows[position.row];
    
    if (row && row.cells[position.column]) {
      row.cells[position.column] = {
        ...row.cells[position.column],
        block: {
          ...block,
          type: sanitizeBlockType(block.type)
        }
      };
      setLayout(prev => prev ? { ...prev, rows: newRows } : null);
    }
  }, [layout]);

  const removeBlockFromCell = useCallback((position: GridPosition) => {
    if (!layout) return;

    const newRows = [...layout.rows];
    const row = newRows[position.row];
    
    if (row && row.cells[position.column]) {
      row.cells[position.column] = {
        ...row.cells[position.column],
        block: null
      };
      setLayout(prev => prev ? { ...prev, rows: newRows } : null);
    }
  }, [layout]);

  const generateGridLayout = useCallback((rowCount: number, columnCount: number): Grid2DLayout => {
    const rows: GridRow[] = [];
    
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const cells: GridCell[] = [];
      
      for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        cells.push({
          id: `cell-${rowIndex}-${colIndex}`,
          row: rowIndex,
          column: colIndex,
          position: colIndex, // Add required position property
          block: null
        });
      }
      
      rows.push({
        id: `row-${rowIndex}`,
        index: rowIndex,
        cells
      });
    }

    return {
      id: `grid-${Date.now()}`,
      rows,
      columns: columnCount,
      gap: 16
    };
  }, []);

  const isValidPosition = useCallback((position: GridPosition): boolean => {
    if (!layout) return false;
    
    return position.row >= 0 && 
           position.row < layout.rows.length && 
           position.column >= 0 && 
           position.column < (layout.rows[position.row]?.cells.length || 0);
  }, [layout]);

  const getBlockAtPosition = useCallback((position: GridPosition): ReviewBlock | null => {
    if (!layout || !isValidPosition(position)) return null;
    
    return layout.rows[position.row]?.cells[position.column]?.block || null;
  }, [layout, isValidPosition]);

  const memoizedLayout = useMemo(() => layout, [layout]);

  return {
    layout: memoizedLayout,
    updateLayout,
    updateRowColumnCount,
    updateColumnWidths,
    updateRowHeights,
    addBlockToCell,
    removeBlockFromCell,
    generateGridLayout,
    isValidPosition,
    getBlockAtPosition,
  };
};
