
// ABOUTME: Layout management hook for multi-block row operations and responsive grid handling
// Provides comprehensive layout manipulation with state management and persistence

import { useCallback, useState } from 'react';
import { ReviewBlock } from '@/types/review';

interface LayoutRow {
  id: string;
  blocks: ReviewBlock[];
  layout: {
    columns: number;
    gap: 'sm' | 'md' | 'lg';
    alignment: 'stretch' | 'start' | 'center' | 'end';
  };
}

interface UseLayoutManagementOptions {
  blocks: ReviewBlock[];
  onUpdateBlocks: (blocks: ReviewBlock[]) => void;
}

export const useLayoutManagement = ({ blocks, onUpdateBlocks }: UseLayoutManagementOptions) => {
  const [layoutRows, setLayoutRows] = useState<LayoutRow[]>([]);

  // Convert flat blocks to layout rows
  const createLayoutFromBlocks = useCallback((blockList: ReviewBlock[]) => {
    // For now, each block gets its own row (single-block layout)
    // This can be enhanced to group blocks based on layout metadata
    const rows: LayoutRow[] = blockList.map((block, index) => ({
      id: `row-${index}`,
      blocks: [block],
      layout: {
        columns: 1,
        gap: 'md',
        alignment: 'stretch'
      }
    }));
    return rows;
  }, []);

  // Convert layout rows back to flat blocks
  const flattenLayoutToBlocks = useCallback((rows: LayoutRow[]) => {
    const flatBlocks: ReviewBlock[] = [];
    rows.forEach((row, rowIndex) => {
      row.blocks.forEach((block, blockIndex) => {
        flatBlocks.push({
          ...block,
          sort_index: flatBlocks.length,
          meta: {
            ...block.meta,
            layout: {
              rowId: row.id,
              rowIndex,
              columnIndex: blockIndex,
              ...row.layout
            }
          }
        });
      });
    });
    return flatBlocks;
  }, []);

  // Create a new row with specified layout
  const createLayoutRow = useCallback((
    blockIds: number[], 
    layout: LayoutRow['layout']
  ) => {
    const rowBlocks = blocks.filter(block => blockIds.includes(block.id));
    const newRow: LayoutRow = {
      id: `row-${Date.now()}`,
      blocks: rowBlocks,
      layout
    };

    const updatedRows = [...layoutRows, newRow];
    setLayoutRows(updatedRows);
    
    // Update the main blocks array
    const updatedBlocks = flattenLayoutToBlocks(updatedRows);
    onUpdateBlocks(updatedBlocks);

    return newRow.id;
  }, [blocks, layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Update layout configuration for a row
  const updateRowLayout = useCallback((
    rowId: string, 
    layoutUpdate: Partial<LayoutRow['layout']>
  ) => {
    const updatedRows = layoutRows.map(row => 
      row.id === rowId 
        ? { ...row, layout: { ...row.layout, ...layoutUpdate } }
        : row
    );
    
    setLayoutRows(updatedRows);
    
    // Update the main blocks array with new layout metadata
    const updatedBlocks = flattenLayoutToBlocks(updatedRows);
    onUpdateBlocks(updatedBlocks);
  }, [layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Add block to existing row
  const addBlockToRow = useCallback((
    rowId: string, 
    block: ReviewBlock, 
    position?: number
  ) => {
    const updatedRows = layoutRows.map(row => {
      if (row.id === rowId) {
        const newBlocks = [...row.blocks];
        if (position !== undefined) {
          newBlocks.splice(position, 0, block);
        } else {
          newBlocks.push(block);
        }
        return { ...row, blocks: newBlocks };
      }
      return row;
    });

    setLayoutRows(updatedRows);
    
    const updatedBlocks = flattenLayoutToBlocks(updatedRows);
    onUpdateBlocks(updatedBlocks);
  }, [layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Remove block from row
  const removeBlockFromRow = useCallback((rowId: string, blockId: number) => {
    const updatedRows = layoutRows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          blocks: row.blocks.filter(block => block.id !== blockId)
        };
      }
      return row;
    }).filter(row => row.blocks.length > 0); // Remove empty rows

    setLayoutRows(updatedRows);
    
    const updatedBlocks = flattenLayoutToBlocks(updatedRows);
    onUpdateBlocks(updatedBlocks);
  }, [layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Move block between rows
  const moveBlockBetweenRows = useCallback((
    blockId: number,
    sourceRowId: string,
    targetRowId: string,
    position?: number
  ) => {
    let blockToMove: ReviewBlock | null = null;
    
    // Remove from source row
    const updatedRows = layoutRows.map(row => {
      if (row.id === sourceRowId) {
        const blockIndex = row.blocks.findIndex(b => b.id === blockId);
        if (blockIndex >= 0) {
          blockToMove = row.blocks[blockIndex];
          return {
            ...row,
            blocks: row.blocks.filter(b => b.id !== blockId)
          };
        }
      }
      return row;
    });

    // Add to target row
    if (blockToMove) {
      const finalRows = updatedRows.map(row => {
        if (row.id === targetRowId) {
          const newBlocks = [...row.blocks];
          if (position !== undefined) {
            newBlocks.splice(position, 0, blockToMove!);
          } else {
            newBlocks.push(blockToMove!);
          }
          return { ...row, blocks: newBlocks };
        }
        return row;
      }).filter(row => row.blocks.length > 0);

      setLayoutRows(finalRows);
      
      const updatedBlocks = flattenLayoutToBlocks(finalRows);
      onUpdateBlocks(updatedBlocks);
    }
  }, [layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Split row at specific block
  const splitRowAtBlock = useCallback((rowId: string, blockId: number) => {
    const sourceRow = layoutRows.find(row => row.id === rowId);
    if (!sourceRow) return;

    const blockIndex = sourceRow.blocks.findIndex(b => b.id === blockId);
    if (blockIndex <= 0) return; // Can't split if block is first or not found

    const firstRowBlocks = sourceRow.blocks.slice(0, blockIndex);
    const secondRowBlocks = sourceRow.blocks.slice(blockIndex);

    const newRowId = `row-${Date.now()}`;
    const updatedRows = layoutRows.map(row => {
      if (row.id === rowId) {
        return { ...row, blocks: firstRowBlocks };
      }
      return row;
    });

    // Insert new row after the current one
    const rowIndex = layoutRows.findIndex(row => row.id === rowId);
    updatedRows.splice(rowIndex + 1, 0, {
      id: newRowId,
      blocks: secondRowBlocks,
      layout: { ...sourceRow.layout }
    });

    setLayoutRows(updatedRows);
    
    const updatedBlocks = flattenLayoutToBlocks(updatedRows);
    onUpdateBlocks(updatedBlocks);

    return newRowId;
  }, [layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Merge row with next row
  const mergeWithNextRow = useCallback((rowId: string) => {
    const rowIndex = layoutRows.findIndex(row => row.id === rowId);
    if (rowIndex < 0 || rowIndex >= layoutRows.length - 1) return;

    const currentRow = layoutRows[rowIndex];
    const nextRow = layoutRows[rowIndex + 1];

    const mergedBlocks = [...currentRow.blocks, ...nextRow.blocks];
    
    const updatedRows = layoutRows.filter((_, index) => index !== rowIndex + 1);
    updatedRows[rowIndex] = {
      ...currentRow,
      blocks: mergedBlocks
    };

    setLayoutRows(updatedRows);
    
    const updatedBlocks = flattenLayoutToBlocks(updatedRows);
    onUpdateBlocks(updatedBlocks);
  }, [layoutRows, flattenLayoutToBlocks, onUpdateBlocks]);

  // Initialize layout from current blocks
  const initializeLayout = useCallback(() => {
    const rows = createLayoutFromBlocks(blocks);
    setLayoutRows(rows);
  }, [blocks, createLayoutFromBlocks]);

  return {
    layoutRows,
    initializeLayout,
    createLayoutRow,
    updateRowLayout,
    addBlockToRow,
    removeBlockFromRow,
    moveBlockBetweenRows,
    splitRowAtBlock,
    mergeWithNextRow,
    flattenLayoutToBlocks
  };
};
