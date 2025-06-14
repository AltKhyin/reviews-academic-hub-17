
// ABOUTME: Layout management hook with proper type definitions and grid integration
import { useState, useCallback, useMemo } from 'react';
import { ReviewBlock } from '@/types/review';

interface LayoutRowData {
  id: string;
  type: 'standard' | 'grid' | '2d-grid';
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
}

interface UseLayoutManagementProps {
  blocks: ReviewBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onBlocksChange: (blocks: ReviewBlock[]) => void;
}

export const useLayoutManagement = ({
  blocks,
  onUpdateBlock,
  onBlocksChange
}: UseLayoutManagementProps) => {

  const [layoutRows, setLayoutRows] = useState<LayoutRowData[]>([]);

  const generateLayoutFromBlocks = useCallback((blocks: ReviewBlock[]): LayoutRowData[] => {
    const rows: LayoutRowData[] = [];
    const processedBlocks = new Set<string>();

    blocks.forEach((block, index) => {
      if (processedBlocks.has(block.id)) return;

      const layout = block.meta?.layout;
      
      if (layout?.row_id) {
        // Find or create row for grid blocks
        let existingRow = rows.find(r => r.id === layout.row_id);
        
        if (!existingRow) {
          existingRow = {
            id: layout.row_id,
            type: layout.grid_rows && layout.grid_rows > 1 ? '2d-grid' : 'grid',
            blocks: [],
            columns: layout.columns || 2,
            gap: layout.gap || 16,
          };
          rows.push(existingRow);
        }
        
        existingRow.blocks.push(block);
        processedBlocks.add(block.id);
      } else {
        // Standard single block row
        rows.push({
          id: `row-${block.id}`,
          type: 'standard',
          blocks: [block],
          columns: 1,
          gap: 0,
        });
        processedBlocks.add(block.id);
      }
    });

    return rows;
  }, []);

  const updateRowLayout = useCallback((rowId: string, updates: Partial<LayoutRowData>) => {
    setLayoutRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, ...updates } : row
    ));

    // Update corresponding blocks
    const row = layoutRows.find(r => r.id === rowId);
    if (row && updates.columns) {
      row.blocks.forEach(block => {
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: {
              ...block.meta?.layout,
              columns: updates.columns
            }
          }
        });
      });
    }
  }, [layoutRows, onUpdateBlock]);

  const addBlockToRow = useCallback((rowId: string, block: ReviewBlock, position?: number) => {
    const row = layoutRows.find(r => r.id === rowId);
    if (!row) return;

    const updatedBlocks = [...row.blocks];
    if (typeof position === 'number') {
      updatedBlocks.splice(position, 0, block);
    } else {
      updatedBlocks.push(block);
    }

    // Update block metadata
    onUpdateBlock(block.id, {
      meta: {
        ...block.meta,
        layout: {
          ...block.meta?.layout,
          row_id: rowId,
          columns: row.columns,
          position: position ?? updatedBlocks.length - 1
        }
      }
    });

    setLayoutRows(prev => prev.map(r => 
      r.id === rowId ? { ...r, blocks: updatedBlocks } : r
    ));
  }, [layoutRows, onUpdateBlock]);

  const removeBlockFromRow = useCallback((rowId: string, blockId: string) => {
    const row = layoutRows.find(r => r.id === rowId);
    if (!row) return;

    const updatedBlocks = row.blocks.filter(b => b.id !== blockId);
    
    if (updatedBlocks.length === 0) {
      // Remove empty row
      setLayoutRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setLayoutRows(prev => prev.map(r => 
        r.id === rowId ? { ...r, blocks: updatedBlocks } : r
      ));
    }

    // Clear block layout metadata
    onUpdateBlock(blockId, {
      meta: {
        ...blocks.find(b => b.id === blockId)?.meta,
        layout: undefined
      }
    });
  }, [layoutRows, onUpdateBlock, blocks]);

  const getBlockPosition = useCallback((blockId: string): { rowId: string; position: number } | null => {
    for (const row of layoutRows) {
      const position = row.blocks.findIndex(b => b.id === blockId);
      if (position !== -1) {
        return { rowId: row.id, position };
      }
    }
    return null;
  }, [layoutRows]);

  const moveBlockWithinRow = useCallback((rowId: string, fromIndex: number, toIndex: number) => {
    const row = layoutRows.find(r => r.id === rowId);
    if (!row) return;

    const updatedBlocks = [...row.blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);

    // Update position metadata for affected blocks
    updatedBlocks.forEach((block, index) => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            position: index
          }
        }
      });
    });

    setLayoutRows(prev => prev.map(r => 
      r.id === rowId ? { ...r, blocks: updatedBlocks } : r
    ));
  }, [layoutRows, onUpdateBlock]);

  const memoizedRows = useMemo(() => 
    generateLayoutFromBlocks(blocks), 
    [blocks, generateLayoutFromBlocks]
  );

  return {
    layoutRows: memoizedRows,
    updateRowLayout,
    addBlockToRow,
    removeBlockFromRow,
    getBlockPosition,
    moveBlockWithinRow,
    generateLayoutFromBlocks,
  };
};
