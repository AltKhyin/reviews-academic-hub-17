
// ABOUTME: Hook for managing 2D grid layouts
// Provides state management and operations for vertical grid functionality

import { useState, useCallback, useMemo } from 'react';
import { Grid2DLayout, GridPosition, GridOperationResult } from '@/types/grid';
import { ReviewBlock } from '@/types/review';
import { 
  createEmptyGrid, 
  addRowToGrid, 
  removeRowFromGrid, 
  placeBlockInGrid, 
  removeBlockFromGrid,
  getBlocksFromGrid,
  findBlockInGrid,
  gridHasBlocks,
  validateGrid
} from '@/utils/grid2DUtils';

interface UseGrid2DManagerProps {
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock?: (type: string, position?: number) => void;
}

export const useGrid2DManager = ({
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock
}: UseGrid2DManagerProps) => {
  const [grids, setGrids] = useState<Map<string, Grid2DLayout>>(new Map());

  // Create new grid
  const createGrid = useCallback((
    columns: number, 
    rows: number = 1, 
    initialBlocks?: ReviewBlock[]
  ): GridOperationResult => {
    try {
      const newGrid = createEmptyGrid(columns, rows);
      
      // Place initial blocks if provided
      if (initialBlocks) {
        let updatedGrid = newGrid;
        initialBlocks.forEach((block, index) => {
          const row = Math.floor(index / columns);
          const column = index % columns;
          
          if (row < rows) {
            const position: GridPosition = { row, column };
            updatedGrid = placeBlockInGrid(updatedGrid, block, position);
          }
        });
        
        setGrids(prev => new Map(prev).set(newGrid.id, updatedGrid));
        return { success: true, grid: updatedGrid };
      }
      
      setGrids(prev => new Map(prev).set(newGrid.id, newGrid));
      return { success: true, grid: newGrid };
    } catch (error) {
      console.error('Failed to create grid:', error);
      return { success: false, error: String(error) };
    }
  }, []);

  // Add row to grid
  const addRowToGridById = useCallback((
    gridId: string, 
    position: 'above' | 'below', 
    targetRowIndex: number
  ): GridOperationResult => {
    try {
      const grid = grids.get(gridId);
      if (!grid) {
        return { success: false, error: 'Grid not found' };
      }

      const updatedGrid = addRowToGrid(grid, position, targetRowIndex);
      
      if (!validateGrid(updatedGrid)) {
        return { success: false, error: 'Invalid grid structure after row addition' };
      }

      setGrids(prev => new Map(prev).set(gridId, updatedGrid));
      return { success: true, grid: updatedGrid };
    } catch (error) {
      console.error('Failed to add row to grid:', error);
      return { success: false, error: String(error) };
    }
  }, [grids]);

  // Remove row from grid
  const removeRowFromGridById = useCallback((
    gridId: string, 
    rowIndex: number
  ): GridOperationResult => {
    try {
      const grid = grids.get(gridId);
      if (!grid) {
        return { success: false, error: 'Grid not found' };
      }

      // Check if row has blocks and handle deletion
      const rowToRemove = grid.rows[rowIndex];
      if (rowToRemove) {
        rowToRemove.cells.forEach(cell => {
          if (cell.block) {
            onDeleteBlock(cell.block.id);
          }
        });
      }

      const updatedGrid = removeRowFromGrid(grid, rowIndex);
      
      if (!validateGrid(updatedGrid)) {
        return { success: false, error: 'Invalid grid structure after row removal' };
      }

      setGrids(prev => new Map(prev).set(gridId, updatedGrid));
      return { success: true, grid: updatedGrid };
    } catch (error) {
      console.error('Failed to remove row from grid:', error);
      return { success: false, error: String(error) };
    }
  }, [grids, onDeleteBlock]);

  // Place block in grid
  const placeBlockInGridById = useCallback((
    gridId: string,
    block: ReviewBlock,
    position: GridPosition
  ): GridOperationResult => {
    try {
      const grid = grids.get(gridId);
      if (!grid) {
        return { success: false, error: 'Grid not found' };
      }

      const updatedGrid = placeBlockInGrid(grid, block, position);
      
      // Update block metadata
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            grid_id: gridId,
            grid_position: position,
            grid_rows: updatedGrid.rows.length,
            columns: updatedGrid.columns,
            gap: updatedGrid.gap,
            columnWidths: updatedGrid.columnWidths,
            rowHeights: updatedGrid.rowHeights
          }
        }
      });

      setGrids(prev => new Map(prev).set(gridId, updatedGrid));
      return { success: true, grid: updatedGrid };
    } catch (error) {
      console.error('Failed to place block in grid:', error);
      return { success: false, error: String(error) };
    }
  }, [grids, onUpdateBlock]);

  // Remove block from grid
  const removeBlockFromGridById = useCallback((
    gridId: string,
    position: GridPosition
  ): GridOperationResult => {
    try {
      const grid = grids.get(gridId);
      if (!grid) {
        return { success: false, error: 'Grid not found' };
      }

      const updatedGrid = removeBlockFromGrid(grid, position);
      setGrids(prev => new Map(prev).set(gridId, updatedGrid));
      return { success: true, grid: updatedGrid };
    } catch (error) {
      console.error('Failed to remove block from grid:', error);
      return { success: false, error: String(error) };
    }
  }, [grids]);

  // Get grid by ID
  const getGrid = useCallback((gridId: string): Grid2DLayout | undefined => {
    return grids.get(gridId);
  }, [grids]);

  // Get all grids
  const getAllGrids = useCallback((): Grid2DLayout[] => {
    return Array.from(grids.values());
  }, [grids]);

  // Delete grid
  const deleteGrid = useCallback((gridId: string): boolean => {
    const grid = grids.get(gridId);
    if (!grid) return false;

    // Delete all blocks in grid
    const blocks = getBlocksFromGrid(grid);
    blocks.forEach(block => onDeleteBlock(block.id));

    setGrids(prev => {
      const newMap = new Map(prev);
      newMap.delete(gridId);
      return newMap;
    });

    return true;
  }, [grids, onDeleteBlock]);

  // Update grid layout properties
  const updateGridLayout = useCallback((
    gridId: string,
    updates: Partial<Pick<Grid2DLayout, 'gap' | 'columnWidths' | 'rowHeights'>>
  ): GridOperationResult => {
    try {
      const grid = grids.get(gridId);
      if (!grid) {
        return { success: false, error: 'Grid not found' };
      }

      const updatedGrid: Grid2DLayout = {
        ...grid,
        ...updates
      };

      // Update all block metadata in grid
      const blocks = getBlocksFromGrid(updatedGrid);
      blocks.forEach(block => {
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: {
              ...block.meta?.layout,
              gap: updatedGrid.gap,
              columnWidths: updatedGrid.columnWidths,
              rowHeights: updatedGrid.rowHeights
            }
          }
        });
      });

      setGrids(prev => new Map(prev).set(gridId, updatedGrid));
      return { success: true, grid: updatedGrid };
    } catch (error) {
      console.error('Failed to update grid layout:', error);
      return { success: false, error: String(error) };
    }
  }, [grids, onUpdateBlock]);

  // Get statistics
  const gridStats = useMemo(() => {
    const totalGrids = grids.size;
    const totalBlocks = Array.from(grids.values())
      .reduce((sum, grid) => sum + getBlocksFromGrid(grid).length, 0);
    
    return { totalGrids, totalBlocks };
  }, [grids]);

  return {
    // State
    grids: Array.from(grids.values()),
    gridStats,
    
    // Grid operations
    createGrid,
    getGrid,
    getAllGrids,
    deleteGrid,
    updateGridLayout,
    
    // Row operations
    addRowToGridById,
    removeRowFromGridById,
    
    // Block operations
    placeBlockInGridById,
    removeBlockFromGridById,
    
    // Utilities
    findBlockInGrid: (gridId: string, blockId: number) => {
      const grid = grids.get(gridId);
      return grid ? findBlockInGrid(grid, blockId) : null;
    },
    gridHasBlocks: (gridId: string) => {
      const grid = grids.get(gridId);
      return grid ? gridHasBlocks(grid) : false;
    }
  };
};
