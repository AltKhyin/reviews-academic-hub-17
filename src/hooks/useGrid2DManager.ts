
// ABOUTME: 2D grid management hook with vertical and horizontal operations
// Provides complete 2D grid functionality including row/column operations

import { useCallback, useMemo, useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout, GridPosition, GridRow, GridCell } from '@/types/grid';
import { 
  createEmptyGrid, 
  addRowToGrid, 
  removeRowFromGrid, 
  placeBlockInGrid, 
  removeBlockFromGrid,
  getBlocksFromGrid,
  findBlockInGrid,
  validateGrid
} from '@/utils/grid2DUtils';

interface UseGrid2DManagerProps {
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onAddBlock: (type: string, position?: number) => void;
}

export const useGrid2DManager = ({
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock
}: UseGrid2DManagerProps) => {
  const [grids, setGrids] = useState<Grid2DLayout[]>([]);

  // Extract grids from blocks with grid_id metadata
  const extractGridsFromBlocks = useCallback((blocks: ReviewBlock[]): Grid2DLayout[] => {
    const gridMap = new Map<string, Grid2DLayout>();
    
    blocks.forEach(block => {
      const gridId = block.meta?.layout?.grid_id;
      const gridPosition = block.meta?.layout?.grid_position;
      
      if (gridId && gridPosition) {
        if (!gridMap.has(gridId)) {
          // Create new grid from block metadata
          const gridMetadata = block.meta.layout;
          const newGrid = createEmptyGrid(
            gridMetadata.columns || 2,
            gridMetadata.grid_rows || 1,
            gridMetadata.gap || 4
          );
          newGrid.id = gridId;
          gridMap.set(gridId, newGrid);
        }
        
        const grid = gridMap.get(gridId)!;
        const updatedGrid = placeBlockInGrid(grid, block, gridPosition);
        gridMap.set(gridId, updatedGrid);
      }
    });
    
    return Array.from(gridMap.values());
  }, []);

  // Create new 2D grid
  const createGrid = useCallback((columns: number = 2, rows: number = 1): Grid2DLayout => {
    const newGrid = createEmptyGrid(columns, rows, 4);
    
    setGrids(prev => [...prev, newGrid]);
    
    console.log('Created new 2D grid:', { 
      gridId: newGrid.id, 
      columns, 
      rows 
    });
    
    return newGrid;
  }, []);

  // Add row to existing grid
  const addRowToGridById = useCallback((
    gridId: string, 
    position: 'above' | 'below', 
    targetRowIndex: number
  ): boolean => {
    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      console.error('Grid not found for row addition:', gridId);
      return false;
    }

    try {
      const updatedGrid = addRowToGrid(grid, position, targetRowIndex);
      
      setGrids(prev => prev.map(g => 
        g.id === gridId ? updatedGrid : g
      ));
      
      // Update all blocks in the grid with new row count
      const gridBlocks = getBlocksFromGrid(updatedGrid);
      gridBlocks.forEach(block => {
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: {
              ...block.meta?.layout,
              grid_rows: updatedGrid.rows.length,
              rowHeights: updatedGrid.rowHeights
            }
          }
        });
      });
      
      console.log('Added row to grid:', { 
        gridId, 
        position, 
        targetRowIndex, 
        newRowCount: updatedGrid.rows.length 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add row to grid:', error);
      return false;
    }
  }, [grids, onUpdateBlock]);

  // Remove row from existing grid
  const removeRowFromGridById = useCallback((
    gridId: string, 
    rowIndex: number
  ): boolean => {
    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      console.error('Grid not found for row removal:', gridId);
      return false;
    }

    try {
      // Get blocks in the row to be removed
      const rowToRemove = grid.rows[rowIndex];
      const blocksToRemove = rowToRemove.cells
        .filter(cell => cell.block)
        .map(cell => cell.block!);

      // Remove blocks from the row
      blocksToRemove.forEach(block => {
        onDeleteBlock(block.id);
      });

      // Update grid structure
      const updatedGrid = removeRowFromGrid(grid, rowIndex);
      
      setGrids(prev => prev.map(g => 
        g.id === gridId ? updatedGrid : g
      ));
      
      // Update remaining blocks with new row positions
      const remainingBlocks = getBlocksFromGrid(updatedGrid);
      remainingBlocks.forEach(block => {
        const newPosition = findBlockInGrid(updatedGrid, block.id);
        if (newPosition) {
          onUpdateBlock(block.id, {
            meta: {
              ...block.meta,
              layout: {
                ...block.meta?.layout,
                grid_position: newPosition,
                grid_rows: updatedGrid.rows.length,
                rowHeights: updatedGrid.rowHeights
              }
            }
          });
        }
      });
      
      console.log('Removed row from grid:', { 
        gridId, 
        rowIndex, 
        newRowCount: updatedGrid.rows.length,
        blocksRemoved: blocksToRemove.length
      });
      
      return true;
    } catch (error) {
      console.error('Failed to remove row from grid:', error);
      return false;
    }
  }, [grids, onDeleteBlock, onUpdateBlock]);

  // Place block in specific grid position
  const placeBlockInGridById = useCallback((
    gridId: string, 
    block: ReviewBlock, 
    position: GridPosition
  ): boolean => {
    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      console.error('Grid not found for block placement:', gridId);
      return false;
    }

    try {
      const updatedGrid = placeBlockInGrid(grid, block, position);
      
      setGrids(prev => prev.map(g => 
        g.id === gridId ? updatedGrid : g
      ));
      
      console.log('Placed block in grid:', { 
        gridId, 
        blockId: block.id, 
        position 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to place block in grid:', error);
      return false;
    }
  }, [grids]);

  // Remove block from grid
  const removeBlockFromGridById = useCallback((
    gridId: string, 
    position: GridPosition
  ): boolean => {
    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      console.error('Grid not found for block removal:', gridId);
      return false;
    }

    try {
      const updatedGrid = removeBlockFromGrid(grid, position);
      
      setGrids(prev => prev.map(g => 
        g.id === gridId ? updatedGrid : g
      ));
      
      console.log('Removed block from grid:', { 
        gridId, 
        position 
      });
      
      return true;
    } catch (error) {
      console.error('Failed to remove block from grid:', error);
      return false;
    }
  }, [grids]);

  // Update grid layout (dimensions, gaps, etc.)
  const updateGridLayout = useCallback((
    gridId: string, 
    updates: Partial<Grid2DLayout>
  ): boolean => {
    const grid = grids.find(g => g.id === gridId);
    if (!grid) {
      console.error('Grid not found for layout update:', gridId);
      return false;
    }

    const updatedGrid = { ...grid, ...updates };
    
    setGrids(prev => prev.map(g => 
      g.id === gridId ? updatedGrid : g
    ));
    
    // Update all blocks in grid with new layout metadata
    const gridBlocks = getBlocksFromGrid(updatedGrid);
    gridBlocks.forEach(block => {
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
    
    console.log('Updated grid layout:', { 
      gridId, 
      updates 
    });
    
    return true;
  }, [grids, onUpdateBlock]);

  // Get grid by ID
  const getGridById = useCallback((gridId: string): Grid2DLayout | null => {
    return grids.find(g => g.id === gridId) || null;
  }, [grids]);

  // Validate all grids
  const validateAllGrids = useCallback((): boolean => {
    return grids.every(grid => validateGrid(grid));
  }, [grids]);

  // Convert 1D grid to 2D grid
  const convertTo2DGrid = useCallback((
    blocks: ReviewBlock[], 
    rowId: string
  ): Grid2DLayout | null => {
    if (blocks.length === 0) return null;

    const columns = blocks.length;
    const newGrid = createEmptyGrid(columns, 1, 4);
    
    // Place existing blocks in first row
    blocks.forEach((block, index) => {
      const position: GridPosition = { row: 0, column: index };
      placeBlockInGrid(newGrid, block, position);
    });
    
    setGrids(prev => [...prev, newGrid]);
    
    // Update blocks with 2D grid metadata
    blocks.forEach((block, index) => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            grid_id: newGrid.id,
            grid_position: { row: 0, column: index },
            grid_rows: 1,
            rowHeights: [100]
          }
        }
      });
    });
    
    console.log('Converted 1D grid to 2D:', { 
      rowId, 
      gridId: newGrid.id, 
      blocks: blocks.length 
    });
    
    return newGrid;
  }, [onUpdateBlock]);

  return {
    grids,
    createGrid,
    addRowToGridById,
    removeRowFromGridById,
    placeBlockInGridById,
    removeBlockFromGridById,
    updateGridLayout,
    getGridById,
    validateAllGrids,
    convertTo2DGrid,
    extractGridsFromBlocks
  };
};
