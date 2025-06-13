
// ABOUTME: 2D Grid management hook with comprehensive grid operations
// Handles creation, modification, and deletion of 2D grid structures

import { useState, useCallback, useMemo } from 'react';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';

interface UseGrid2DManagerProps {
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (type: any, position?: number) => string;
}

export const useGrid2DManager = ({
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock
}: UseGrid2DManagerProps) => {
  const [grids, setGrids] = useState<Grid2DLayout[]>([]);

  const extractGridsFromBlocks = useCallback((blocks: ReviewBlock[]) => {
    const gridMap = new Map<string, Grid2DLayout>();
    
    blocks.forEach(block => {
      const gridId = block.meta?.layout?.grid_id;
      const gridPosition = block.meta?.layout?.grid_position;
      
      if (gridId && gridPosition) {
        if (!gridMap.has(gridId)) {
          const layout = block.meta?.layout;
          gridMap.set(gridId, {
            id: gridId,
            rows: [],
            columns: layout?.columns || 2,
            columnWidths: layout?.columnWidths,
            grid_rows: layout?.grid_rows || 2,
            gap: layout?.gap || 4,
            rowHeights: layout?.rowHeights
          });
        }
      }
    });

    const extractedGrids = Array.from(gridMap.values());
    setGrids(extractedGrids);
    return extractedGrids;
  }, []);

  const createGrid = useCallback((id: string, columns: number, rows: number) => {
    const newGrid: Grid2DLayout = {
      id,
      rows: [],
      columns,
      grid_rows: rows,
      gap: 4,
      columnWidths: Array(columns).fill(100 / columns),
      rowHeights: Array(rows).fill(120)
    };
    
    setGrids(prev => [...prev, newGrid]);
    return newGrid;
  }, []);

  const addRowToGridById = useCallback((gridId: string, position: 'above' | 'below', rowIndex: number) => {
    console.log('Adding row to grid:', { gridId, position, rowIndex });
    
    setGrids(prev => prev.map(grid => {
      if (grid.id === gridId) {
        const newRowCount = (grid.grid_rows || 2) + 1;
        const newRowHeights = [...(grid.rowHeights || [])];
        
        const insertIndex = position === 'above' ? rowIndex : rowIndex + 1;
        newRowHeights.splice(insertIndex, 0, 120);
        
        return {
          ...grid,
          grid_rows: newRowCount,
          rowHeights: newRowHeights
        };
      }
      return grid;
    }));
  }, []);

  const removeRowFromGridById = useCallback((gridId: string, rowIndex: number) => {
    console.log('Removing row from grid:', { gridId, rowIndex });
    
    setGrids(prev => prev.map(grid => {
      if (grid.id === gridId) {
        const newRowCount = Math.max(1, (grid.grid_rows || 2) - 1);
        const newRowHeights = [...(grid.rowHeights || [])];
        newRowHeights.splice(rowIndex, 1);
        
        return {
          ...grid,
          grid_rows: newRowCount,
          rowHeights: newRowHeights
        };
      }
      return grid;
    }));
  }, []);

  const placeBlockInGridById = useCallback((blockId: string, gridId: string, position: GridPosition) => {
    console.log('Placing block in grid:', { blockId, gridId, position });
    
    onUpdateBlock(blockId, {
      meta: {
        layout: {
          grid_id: gridId,
          grid_position: position
        }
      }
    });
  }, [onUpdateBlock]);

  const removeBlockFromGridById = useCallback((blockId: string, gridId: string) => {
    console.log('Removing block from grid:', { blockId, gridId });
    
    onUpdateBlock(blockId, {
      meta: {
        layout: undefined
      }
    });
  }, [onUpdateBlock]);

  const updateGridLayout = useCallback((gridId: string, updates: Partial<Grid2DLayout>) => {
    console.log('Updating grid layout:', { gridId, updates });
    
    setGrids(prev => prev.map(grid => 
      grid.id === gridId ? { ...grid, ...updates } : grid
    ));
  }, []);

  return {
    grids,
    createGrid,
    addRowToGridById,
    removeRowFromGridById,
    placeBlockInGridById,
    removeBlockFromGridById,
    updateGridLayout,
    extractGridsFromBlocks
  };
};
