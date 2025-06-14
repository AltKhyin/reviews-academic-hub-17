// ABOUTME: Enhanced 2D grid manager with complete block integration
// Manages 2D grid state with proper block lifecycle management

import { useState, useCallback, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { Grid2DLayout, GridPosition } from '@/types/grid';
import { 
  createEmptyGrid, 
  addRowToGrid, 
  removeRowFromGrid, 
  placeBlockInGrid, 
  removeBlockFromGrid,
  generateGridId,
  validateGrid
} from '@/utils/grid2DUtils';

interface UseGrid2DManagerProps {
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void; // Changed from number to string
  onDeleteBlock: (blockId: string) => void; // Changed from number to string
  onAddBlock: (type: BlockType, position?: number) => string; // Changed return type from number to string
}

export const useGrid2DManager = ({ 
  onUpdateBlock, 
  onDeleteBlock, 
  onAddBlock 
}: UseGrid2DManagerProps) => {
  const [grids, setGrids] = useState<Grid2DLayout[]>([]);

  // Create new 2D grid
  const createGrid = useCallback((columns: number, rows: number = 1, gap: number = 4): string => {
    const newGrid = createEmptyGrid(columns, rows, gap);
    
    setGrids(prev => {
      const updated = [...prev, newGrid];
      console.log('Created new 2D grid:', { gridId: newGrid.id, columns, rows, totalGrids: updated.length });
      return updated;
    });
    
    return newGrid.id;
  }, []);

  // Add row to grid
  const addRowToGridById = useCallback((gridId: string, position: 'above' | 'below', targetRowIndex: number) => {
    setGrids(prev => {
      const updated = prev.map(grid => {
        if (grid.id === gridId) {
          try {
            const newGrid = addRowToGrid(grid, position, targetRowIndex);
            console.log('Added row to grid:', { gridId, position, targetRowIndex, newRowCount: newGrid.rows.length });
            return newGrid;
          } catch (error) {
            console.error('Failed to add row:', error);
            return grid;
          }
        }
        return grid;
      });
      return updated;
    });
  }, []);

  // Remove row from grid
  const removeRowFromGridById = useCallback((gridId: string, rowIndex: number) => {
    setGrids(prev => {
      const updated = prev.map(grid => {
        if (grid.id === gridId) {
          try {
            const newGrid = removeRowFromGrid(grid, rowIndex);
            console.log('Removed row from grid:', { gridId, rowIndex, newRowCount: newGrid.rows.length });
            
            // Remove blocks that were in the deleted row
            const blocksToRemove = grid.rows[rowIndex]?.cells
              .filter(cell => cell.block)
              .map(cell => cell.block!.id) || [];
            
            blocksToRemove.forEach(blockId => {
              console.log('Removing block from deleted row:', blockId);
              onDeleteBlock(blockId);
            });
            
            return newGrid;
          } catch (error) {
            console.error('Failed to remove row:', error);
            return grid;
          }
        }
        return grid;
      });
      return updated;
    });
  }, [onDeleteBlock]);

  // Place block in grid
  const placeBlockInGridById = useCallback((blockId: string, gridId: string, position: GridPosition) => { // Changed from number to string
    console.log('Placing block in grid:', { blockId, gridId, position });
    
    setGrids(prev => {
      const gridIndex = prev.findIndex(g => g.id === gridId);
      if (gridIndex === -1) {
        console.error('Grid not found:', gridId);
        return prev;
      }

      const grid = prev[gridIndex];
      const { row, column } = position;
      
      // Validate position
      if (row >= grid.rows.length || column >= grid.columns || row < 0 || column < 0) {
        console.error('Invalid grid position:', { position, gridBounds: { rows: grid.rows.length, columns: grid.columns } });
        return prev;
      }

      // Check if cell is already occupied
      const existingBlock = grid.rows[row]?.cells[column]?.block;
      if (existingBlock) {
        console.warn('Cell already occupied:', { position, existingBlockId: existingBlock.id });
        // Remove the existing block
        onDeleteBlock(existingBlock.id);
      }

      // Update block metadata to include grid information
      onUpdateBlock(blockId, {
        meta: {
          layout: {
            grid_id: gridId,
            grid_position: position,
            grid_rows: grid.rows.length,
            columns: grid.columns,
            gap: grid.gap,
            columnWidths: grid.columnWidths,
            rowHeights: grid.rowHeights
          }
        }
      });

      return prev; // Grid state will be updated by extractGridsFromBlocks
    });
  }, [onUpdateBlock, onDeleteBlock]);

  // Remove block from grid
  const removeBlockFromGridById = useCallback((blockId: string, gridId: string) => { // Changed from number to string
    console.log('Removing block from grid:', { blockId, gridId });
    
    // Just delete the block - the grid will be updated by extractGridsFromBlocks
    onDeleteBlock(blockId);
  }, [onDeleteBlock]);

  // Update grid layout (dimensions, gaps, etc.)
  const updateGridLayout = useCallback((gridId: string, updates: Partial<Grid2DLayout>) => {
    setGrids(prev => {
      const updated = prev.map(grid => {
        if (grid.id === gridId) {
          const newGrid = { ...grid, ...updates };
          
          // Validate the updated grid
          if (validateGrid(newGrid)) {
            console.log('Updated grid layout:', { gridId, updates });
            return newGrid;
          } else {
            console.error('Invalid grid layout update:', { gridId, updates });
            return grid;
          }
        }
        return grid;
      });
      return updated;
    });
  }, []);

  // Extract grids from blocks (reconstruct grid state from block metadata)
  const extractGridsFromBlocks = useCallback((blocks: ReviewBlock[]): Grid2DLayout[] => {
    const gridMap = new Map<string, {
      blocks: ReviewBlock[];
      config: any;
    }>();

    // Group blocks by grid_id
    blocks.forEach(block => {
      const gridId = block.meta?.layout?.grid_id;
      if (gridId) {
        if (!gridMap.has(gridId)) {
          gridMap.set(gridId, { blocks: [], config: block.meta.layout });
        }
        gridMap.get(gridId)!.blocks.push(block);
      }
    });

    // Convert to Grid2DLayout objects
    const extractedGrids: Grid2DLayout[] = [];
    
    gridMap.forEach(({ blocks: gridBlocks, config }, gridId) => {
      if (gridBlocks.length === 0) return;

      const columns = config.columns || 2;
      const rows = config.grid_rows || 2;
      const gap = config.gap || 4;
      const columnWidths = config.columnWidths || Array(columns).fill(100 / columns);
      const rowHeights = config.rowHeights || Array(rows).fill(120);

      // Create grid structure
      const grid: Grid2DLayout = {
        id: gridId,
        columns,
        gap,
        columnWidths,
        rowHeights,
        rows: Array.from({ length: rows }, (_, rowIndex) => ({
          id: `${gridId}-row-${rowIndex}`,
          index: rowIndex,
          cells: Array.from({ length: columns }, (_, colIndex) => ({
            id: `${gridId}-cell-${rowIndex}-${colIndex}`,
            row: rowIndex,
            column: colIndex,
            block: undefined
          }))
        }))
      };

      // Place blocks in their positions
      gridBlocks.forEach(block => {
        const position = block.meta?.layout?.grid_position;
        if (position && position.row < rows && position.column < columns) {
          grid.rows[position.row].cells[position.column].block = block;
        } else {
          console.warn('Block has invalid grid position:', { 
            blockId: block.id, 
            position, 
            gridBounds: { rows, columns } 
          });
        }
      });

      extractedGrids.push(grid);
    });

    // Update internal grid state
    setGrids(extractedGrids);
    
    return extractedGrids;
  }, []);

  // Get grid by ID
  const getGridById = useCallback((gridId: string): Grid2DLayout | undefined => {
    return grids.find(grid => grid.id === gridId);
  }, [grids]);

  // Clean up empty grids (grids with no blocks)
  const cleanupEmptyGrids = useCallback(() => {
    setGrids(prev => {
      const filtered = prev.filter(grid => {
        const hasBlocks = grid.rows.some(row => 
          row.cells.some(cell => cell.block !== undefined)
        );
        
        if (!hasBlocks) {
          console.log('Cleaning up empty grid:', grid.id);
        }
        
        return hasBlocks;
      });
      
      return filtered;
    });
  }, []);

  return {
    grids,
    createGrid,
    addRowToGridById,
    removeRowFromGridById,
    placeBlockInGridById,
    removeBlockFromGridById,
    updateGridLayout,
    extractGridsFromBlocks,
    getGridById,
    cleanupEmptyGrids
  };
};
