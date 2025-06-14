// ABOUTME: Enhanced block management hook with string ID support
// Manages block operations, undo/redo, and grid conversions

import { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType, LayoutConfig } from '@/types/review'; // Added LayoutConfig
import { GridPosition } from '@/types/grid';

interface UseBlockManagementProps {
  initialBlocks?: ReviewBlock[];
  issueId?: string; // Not directly used in this hook's logic but good for context
}

interface BlockManagementState {
  blocks: ReviewBlock[];
  activeBlockId: string | null;
  history: ReviewBlock[][];
  historyIndex: number;
}

export const useBlockManagement = ({ 
  initialBlocks = [], 
  // issueId // Not used currently
}: UseBlockManagementProps) => {
  const [state, setState] = useState<BlockManagementState>({
    blocks: initialBlocks.map((b, index) => ({ ...b, sort_index: index })), // Ensure initial sort_index
    activeBlockId: null,
    history: [initialBlocks.map((b, index) => ({ ...b, sort_index: index }))],
    historyIndex: 0
  });

  // Initialize counter based on existing string IDs if they are numeric, otherwise use a different strategy
  // For simplicity, using a UUID-like or timestamp-based approach for new IDs is safer if existing IDs are not purely numeric.
  // Current generateBlockId uses a numeric counter, ensure initialBlocks don't have conflicting numeric string IDs.
  const blockIdCounter = useRef(
    initialBlocks.length > 0 
      ? Math.max(...initialBlocks.map(b => parseInt(b.id, 10)).filter(id => !isNaN(id)), 0) + 1 
      : 1
  );

  const generateBlockId = useCallback((): string => {
    // return `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`; // UUID-like
    return (blockIdCounter.current++).toString(); // Simple numeric string ID
  }, []);

  const updateStateWithHistory = useCallback((newBlocks: ReviewBlock[], newActiveBlockId?: string | null) => {
    // Ensure sort_index is always correct and sequential
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      sort_index: index,
    }));

    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(reorderedBlocks);
      return {
        ...prev,
        blocks: reorderedBlocks,
        activeBlockId: newActiveBlockId !== undefined ? newActiveBlockId : prev.activeBlockId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);
  
  const setActiveBlockId = useCallback((blockId: string | null) => {
    setState(prev => ({ ...prev, activeBlockId: blockId }));
  }, []);

  const addBlock = useCallback((type: BlockType, position?: number): string => {
    const newBlockId = generateBlockId();
    const newBlock: ReviewBlock = {
      id: newBlockId,
      type,
      content: {}, // Initialize with empty content based on type if possible
      sort_index: 0, // Will be set by updateStateWithHistory
      visible: true,
      meta: {}
    };

    let newBlocksList = [...state.blocks];
    if (position !== undefined && position >= 0 && position <= newBlocksList.length) {
      newBlocksList.splice(position, 0, newBlock);
    } else {
      newBlocksList.push(newBlock);
    }
    
    updateStateWithHistory(newBlocksList, newBlockId);
    return newBlockId;
  }, [state.blocks, generateBlockId, updateStateWithHistory]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    const newBlocks = state.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates, meta: { ...block.meta, ...updates.meta } } : block
    );
    updateStateWithHistory(newBlocks);
  }, [state.blocks, updateStateWithHistory]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = state.blocks.filter(block => block.id !== blockId);
    const newActiveBlockId = state.activeBlockId === blockId ? null : state.activeBlockId;
    updateStateWithHistory(newBlocks, newActiveBlockId);
  }, [state.blocks, state.activeBlockId, updateStateWithHistory]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const blockIndex = state.blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...state.blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
    updateStateWithHistory(newBlocks);
  }, [state.blocks, updateStateWithHistory]);

  const duplicateBlock = useCallback((blockId: string): string => {
    const blockToDuplicate = state.blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return ""; // Should not happen

    const newBlockId = generateBlockId();
    // Deep clone content and meta to avoid shared references, especially for objects/arrays
    const duplicatedBlock: ReviewBlock = {
      ...blockToDuplicate,
      id: newBlockId,
      content: JSON.parse(JSON.stringify(blockToDuplicate.content || {})),
      meta: JSON.parse(JSON.stringify(blockToDuplicate.meta || {})),
      // sort_index will be set by updateStateWithHistory
    };

    const insertIndex = state.blocks.findIndex(b => b.id === blockId) + 1;
    const newBlocks = [...state.blocks];
    newBlocks.splice(insertIndex, 0, duplicatedBlock);
    
    updateStateWithHistory(newBlocks, newBlockId);
    return newBlockId;
  }, [state.blocks, generateBlockId, updateStateWithHistory]);

  const convertToGrid = useCallback((blockId: string, columns: number) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;

    const rowId = `row-${Date.now()}`; // Or use a more robust ID generation
    const newLayout: LayoutConfig = {
      ...block.meta?.layout,
      row_id: rowId,
      columns,
      columnWidths: Array(columns).fill(100 / columns),
      gap: 4, // Default gap
      grid_id: undefined, // Clear 2D grid info if any
      grid_position: undefined,
    };
    updateBlock(blockId, { meta: { ...block.meta, layout: newLayout } });
  }, [state.blocks, updateBlock]);

  const convertTo2DGrid = useCallback((blockId: string, columns: number, rows: number) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;

    const gridId = `grid-${Date.now()}`; // Or use a more robust ID generation
    const newLayout: LayoutConfig = {
      ...block.meta?.layout,
      grid_id: gridId,
      grid_position: { row: 0, column: 0 }, // Default position in new grid
      columns,
      grid_rows: rows,
      columnWidths: Array(columns).fill(100 / columns),
      rowHeights: Array(rows).fill(120), // Default row height
      gap: 4, // Default gap
      row_id: undefined, // Clear 1D grid info if any
    };
    updateBlock(blockId, { meta: { ...block.meta, layout: newLayout } });
  }, [state.blocks, updateBlock]);
  
  const mergeBlockIntoGrid = useCallback((draggedBlockId: string, targetRowId: string, targetPositionInRow?: number) => {
    const draggedBlock = state.blocks.find(b => b.id === draggedBlockId);
    // Find the config of the target 1D grid row
    const targetRowConfigBlock = state.blocks.find(b => b.meta?.layout?.row_id === targetRowId);
    
    if (!draggedBlock || !targetRowConfigBlock?.meta?.layout) return;

    const { columns, columnWidths, gap } = targetRowConfigBlock.meta.layout;
    
    const newLayout: LayoutConfig = {
      // Keep essential parts of dragged block's layout if any, or reset
      ...draggedBlock.meta?.layout, 
      row_id: targetRowId,
      columns, // Inherit from target row
      columnWidths, // Inherit
      gap, // Inherit
      grid_id: undefined, // Clear 2D grid info
      grid_position: undefined,
      // position: targetPositionInRow, // This 'position' is for layout within the row, sort_index handles overall order
    };

    // If targetPositionInRow is provided, we need to adjust sort_index carefully.
    // This function primarily sets the block's metadata to belong to the row.
    // The actual visual positioning within the row (which column it occupies) and
    // overall sort_index reordering is complex and might need another step or be part of drag/drop logic.
    // For now, just update metadata. The block will appear in the row, reordering is separate.
    updateBlock(draggedBlockId, { meta: { ...draggedBlock.meta, layout: newLayout } });

    // Optional: Re-sort blocks to reflect new structure.
    // This is tricky as sort_index should reflect the visual order of groups and blocks within them.
    // updateStateWithHistory will re-apply sort_index based on array order.
    // We might need a specific reordering here if targetPositionInRow implies an immediate visual change.
    // For example, splice the block into the correct position in the main blocks array.
    // This requires finding the conceptual "start" of targetRowId in the blocks array.
    // Simplified: let the drag/drop commit reorder the main `blocks` array, then call updateStateWithHistory.

  }, [state.blocks, updateBlock]);

  const placeBlockIn2DGrid = useCallback((blockId: string, gridId: string, position: GridPosition) => {
    const blockToPlace = state.blocks.find(b => b.id === blockId);
    const gridConfigBlock = state.blocks.find(b => b.meta?.layout?.grid_id === gridId);

    if (!blockToPlace || !gridConfigBlock?.meta?.layout) return;

    const { columns, grid_rows, columnWidths, rowHeights, gap } = gridConfigBlock.meta.layout;

    const newLayout: LayoutConfig = {
       // Keep essential parts of block's layout if any, or reset
      ...blockToPlace.meta?.layout,
      grid_id: gridId,
      grid_position: position,
      columns, // Inherit from target grid
      grid_rows, // Inherit
      columnWidths, // Inherit
      rowHeights, // Inherit
      gap, // Inherit
      row_id: undefined, // Clear 1D grid info
    };
    updateBlock(blockId, { meta: { ...blockToPlace.meta, layout: newLayout } });
  }, [state.blocks, updateBlock]);

  const undo = useCallback(() => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      setState(prev => ({
        ...prev,
        blocks: prev.history[newIndex],
        historyIndex: newIndex,
        activeBlockId: null, // Optionally reset active block on undo/redo
      }));
    }
  }, [state.historyIndex]);

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      setState(prev => ({
        ...prev,
        blocks: prev.history[newIndex],
        historyIndex: newIndex,
        activeBlockId: null,
      }));
    }
  }, [state.historyIndex, state.history.length]);

  return {
    blocks: state.blocks,
    activeBlockId: state.activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    convertToGrid,
    convertTo2DGrid,
    mergeBlockIntoGrid,
    placeBlockIn2DGrid,
    undo,
    redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
};
