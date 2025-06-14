
// ABOUTME: Layout management hook for multi-block row system
// Handles creation, modification, and state management of layout rows

import { useState, useCallback } from 'react';
import { ReviewBlock } from '@/types/review';
import { LayoutRowData } from '@/components/editor/layout/LayoutRow';

interface LayoutState {
  rows: LayoutRowData[];
  activeRowId?: string;
  dragState: {
    isDragging: boolean;
    draggedBlockId?: number;
    sourceRowId?: string;
    targetRowId?: string;
    targetPosition?: number;
  };
}

interface UseLayoutManagementProps {
  initialBlocks?: ReviewBlock[];
  onLayoutChange?: (rows: LayoutRowData[]) => void;
}

export const useLayoutManagement = ({ 
  initialBlocks = [], 
  onLayoutChange 
}: UseLayoutManagementProps = {}) => {
  
  // Initialize layout state from blocks
  const initializeLayout = useCallback((): LayoutState => {
    if (initialBlocks.length === 0) {
      return {
        rows: [],
        dragState: { isDragging: false }
      };
    }

    // Group blocks by layout row or create single-column rows
    const rowsMap = new Map<string, ReviewBlock[]>();
    
    initialBlocks.forEach(block => {
      const rowId = block.meta?.layout?.row_id || `row-${block.id}`;
      if (!rowsMap.has(rowId)) {
        rowsMap.set(rowId, []);
      }
      rowsMap.get(rowId)!.push(block);
    });

    const rows: LayoutRowData[] = Array.from(rowsMap.entries()).map(([rowId, blocks]) => {
      const firstBlock = blocks[0];
      const layoutMeta = firstBlock.meta?.layout;
      
      return {
        id: rowId,
        blocks: blocks.sort((a, b) => (a.meta?.layout?.position || 0) - (b.meta?.layout?.position || 0)),
        columns: Math.max(blocks.length, layoutMeta?.columns || 1),
        gap: layoutMeta?.gap || 4,
        responsive: {
          sm: Math.min(blocks.length, 2),
          md: Math.min(blocks.length, 3),
          lg: blocks.length
        }
      };
    });

    return {
      rows: rows.sort((a, b) => {
        const aMinSort = Math.min(...a.blocks.map(b => b.sort_index));
        const bMinSort = Math.min(...b.blocks.map(b => b.sort_index));
        return aMinSort - bMinSort;
      }),
      dragState: { isDragging: false }
    };
  }, [initialBlocks]);

  const [layoutState, setLayoutState] = useState<LayoutState>(initializeLayout);

  // Create new row
  const createRow = useCallback((columns: number = 1): LayoutRowData => {
    return {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blocks: [],
      columns,
      gap: 4,
      responsive: {
        sm: Math.min(columns, 2),
        md: Math.min(columns, 3), 
        lg: columns
      }
    };
  }, []);

  // Add new row
  const addRow = useCallback((position?: number, columns: number = 1) => {
    setLayoutState(prev => {
      const newRow = createRow(columns);
      const newRows = [...prev.rows];
      
      if (position !== undefined) {
        newRows.splice(position, 0, newRow);
      } else {
        newRows.push(newRow);
      }

      const updatedState = {
        ...prev,
        rows: newRows
      };

      onLayoutChange?.(newRows);
      return updatedState;
    });
  }, [createRow, onLayoutChange]);

  // Update row
  const updateRow = useCallback((rowId: string, updates: Partial<LayoutRowData>) => {
    setLayoutState(prev => {
      const newRows = prev.rows.map(row => 
        row.id === rowId ? { ...row, ...updates } : row
      );

      onLayoutChange?.(newRows);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [onLayoutChange]);

  // Delete row
  const deleteRow = useCallback((rowId: string) => {
    setLayoutState(prev => {
      const newRows = prev.rows.filter(row => row.id !== rowId);
      
      onLayoutChange?.(newRows);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [onLayoutChange]);

  // Add block to row
  const addBlockToRow = useCallback((
    rowId: string, 
    position: number, 
    block: ReviewBlock
  ) => {
    setLayoutState(prev => {
      const newRows = prev.rows.map(row => {
        if (row.id !== rowId) return row;

        const newBlocks = [...row.blocks];
        newBlocks.splice(position, 0, {
          ...block,
          meta: {
            ...block.meta,
            layout: {
              row_id: rowId,
              position,
              columns: row.columns,
              gap: row.gap
            }
          }
        });

        // Update positions for blocks after insertion
        newBlocks.forEach((block, index) => {
          if (block.meta?.layout) {
            block.meta.layout.position = index;
          }
        });

        return {
          ...row,
          blocks: newBlocks
        };
      });

      onLayoutChange?.(newRows);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [onLayoutChange]);

  // Move block between rows/positions
  const moveBlock = useCallback((
    blockId: number,
    targetRowId: string,
    targetPosition: number
  ) => {
    setLayoutState(prev => {
      let movedBlock: ReviewBlock | null = null;
      
      // Remove block from source row
      const rowsAfterRemoval = prev.rows.map(row => ({
        ...row,
        blocks: row.blocks.filter(block => {
          if (block.id === blockId) {
            movedBlock = block;
            return false;
          }
          return true;
        })
      }));

      if (!movedBlock) return prev;

      // Add block to target row
      const newRows = rowsAfterRemoval.map(row => {
        if (row.id !== targetRowId) return row;

        const newBlocks = [...row.blocks];
        newBlocks.splice(targetPosition, 0, {
          ...movedBlock!,
          meta: {
            ...movedBlock!.meta,
            layout: {
              row_id: targetRowId,
              position: targetPosition,
              columns: row.columns,
              gap: row.gap
            }
          }
        });

        // Update positions
        newBlocks.forEach((block, index) => {
          if (block.meta?.layout) {
            block.meta.layout.position = index;
          }
        });

        return {
          ...row,
          blocks: newBlocks
        };
      });

      onLayoutChange?.(newRows);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [onLayoutChange]);

  // Remove block from layout
  const removeBlock = useCallback((blockId: number) => {
    setLayoutState(prev => {
      const newRows = prev.rows.map(row => ({
        ...row,
        blocks: row.blocks.filter(block => block.id !== blockId)
      })).filter(row => row.blocks.length > 0); // Remove empty rows

      onLayoutChange?.(newRows);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [onLayoutChange]);

  // Get all blocks in layout order
  const getAllBlocks = useCallback((): ReviewBlock[] => {
    return layoutState.rows.flatMap(row => row.blocks);
  }, [layoutState.rows]);

  // Update single block
  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    setLayoutState(prev => {
      const newRows = prev.rows.map(row => ({
        ...row,
        blocks: row.blocks.map(block => 
          block.id === blockId ? { ...block, ...updates } : block
        )
      }));

      onLayoutChange?.(newRows);
      return {
        ...prev,
        rows: newRows
      };
    });
  }, [onLayoutChange]);

  // Set active row
  const setActiveRow = useCallback((rowId?: string) => {
    setLayoutState(prev => ({
      ...prev,
      activeRowId: rowId
    }));
  }, []);

  // Drag state management
  const startDrag = useCallback((blockId: number, sourceRowId: string) => {
    setLayoutState(prev => ({
      ...prev,
      dragState: {
        isDragging: true,
        draggedBlockId: blockId,
        sourceRowId
      }
    }));
  }, []);

  const endDrag = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      dragState: { isDragging: false }
    }));
  }, []);

  // Convert layout to flat block list for saving
  const exportBlocks = useCallback((): ReviewBlock[] => {
    let sortIndex = 0;
    return layoutState.rows.flatMap(row => 
      row.blocks.map(block => ({
        ...block,
        sort_index: sortIndex++,
        meta: {
          ...block.meta,
          layout: {
            row_id: row.id,
            position: row.blocks.indexOf(block),
            columns: row.columns,
            gap: row.gap
          }
        }
      }))
    );
  }, [layoutState.rows]);

  return {
    // State
    rows: layoutState.rows,
    activeRowId: layoutState.activeRowId,
    dragState: layoutState.dragState,
    
    // Row operations
    addRow,
    updateRow,
    deleteRow,
    setActiveRow,
    
    // Block operations
    addBlockToRow,
    moveBlock,
    removeBlock,
    updateBlock,
    getAllBlocks,
    
    // Drag operations
    startDrag,
    endDrag,
    
    // Export
    exportBlocks
  };
};
