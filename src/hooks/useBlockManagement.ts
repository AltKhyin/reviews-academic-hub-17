// ABOUTME: Enhanced block management hook for a flat list of ReviewBlocks.
// Manages block operations, undo/redo.
import { useState, useCallback, useRef, useEffect } from 'react';
import { ReviewBlock, BlockType, LayoutConfig, Review, LayoutElement, GridPosition, LayoutRowDefinition, ElementDefinition, LayoutColumn } from '@/types/review'; // Added Review, LayoutElement, GridPosition, LayoutRowDefinition
import { generateId } from '@/lib/utils'; // Assuming generateId is in utils

export interface UseBlockManagementReturn {
  elements: LayoutElement[];
  blocks: { [key: string]: ReviewBlock };
  activeBlockId: string | null;
  setActiveBlockId: (blockId: string | null) => void;
  addBlock: (options: { 
    type: BlockType; 
    initialContent?: any; 
    parentElementId?: string; // ID of parent LayoutElement (e.g., column, grid)
    targetPosition?: GridPosition | number; // For grids or specific index in a column
    insertAtIndex?: number; // For top-level elements array
  }) => string | null; // Returns new block ID or null if error
  updateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  deleteBlock: (blockId: string) => void;
  moveElement: (elementId: string, direction: 'up' | 'down') => void; // Moves LayoutElement in elements array
  updateElement: (elementId: string, updates: Partial<LayoutElement>) => void;
  setElements: (elements: LayoutElement[]) => void; // To allow direct manipulation, e.g., by DND
  setBlocks: (blocks: { [key: string]: ReviewBlock }) => void; // For DND or complex updates
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface BlockManagementHistory {
  elements: LayoutElement[];
  blocks: { [key: string]: ReviewBlock };
}


export const useBlockManagement = (
  initialElements: LayoutElement[] = [],
  initialBlocks: { [key: string]: ReviewBlock } = {},
  onStateChange?: (newElements: LayoutElement[], newBlocks: { [key: string]: ReviewBlock }) => void
): UseBlockManagementReturn => {
  const [elements, setInternalElements] = useState<LayoutElement[]>(initialElements);
  const [blocks, setInternalBlocks] = useState<{ [key: string]: ReviewBlock }>(initialBlocks);
  const [activeBlockId, setActiveBlockIdState] = useState<string | null>(null);

  const history = useRef<BlockManagementHistory[]>([]);
  const historyIndex = useRef(-1);

  const updateStateAndHistory = useCallback((newElements: LayoutElement[], newBlocks: { [key: string]: ReviewBlock }) => {
    // ... keep existing code (setInternalElements, setInternalBlocks, onStateChange, history update)
    setInternalElements(newElements);
    setInternalBlocks(newBlocks);

    if (onStateChange) {
      onStateChange(newElements, newBlocks);
    }

    const currentHistoryState = { elements: newElements, blocks: newBlocks };
    // Clear redo stack
    if (historyIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyIndex.current + 1);
    }
    history.current.push(currentHistoryState);
    historyIndex.current = history.current.length - 1;
  }, [onStateChange]);
  
  useEffect(() => { // Initialize history
    // Ensure initial state is also part of history
    const currentHistoryState = { elements: initialElements, blocks: initialBlocks };
    history.current = [currentHistoryState];
    historyIndex.current = 0;
    setInternalElements(initialElements);
    setInternalBlocks(initialBlocks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialElements, initialBlocks]); // React to changes in initial props if needed for reset


  const setActiveBlockId = useCallback((blockId: string | null) => {
    setActiveBlockIdState(blockId);
  }, []);

  const addBlock = useCallback((options: { 
    type: BlockType; 
    initialContent?: any; 
    parentElementId?: string; 
    targetPosition?: GridPosition | number;
    insertAtIndex?: number;
  }): string | null => {
    const { type, initialContent = {}, parentElementId, targetPosition, insertAtIndex } = options;
    const newBlockId = generateId();
    const newBlock: ReviewBlock = {
      id: newBlockId,
      type,
      content: initialContent,
      sort_index: 0, 
      visible: true,
      meta: {},
    };

    let success = false;
    let finalElements = [...elements];
    let finalBlocks = { ...blocks };

    if (parentElementId) {
      let parentFoundAndUpdated = false;
      // Function to recursively find and update parent. For now, simplified to top-level.
      // More robust solution would handle deeply nested layouts.
      finalElements = finalElements.map(el => {
        if (el.id === parentElementId) {
          if (el.type === 'grid' && typeof targetPosition === 'object' && targetPosition !== null && 'row' in targetPosition && 'col' in targetPosition) {
            const gridEl = el as LayoutElement & { type: 'grid', rows: LayoutRowDefinition[] }; // Make sure rows is not undefined
            const { row, col } = targetPosition as GridPosition;
            if (gridEl.rows && gridEl.rows[row] && gridEl.rows[row].cells && gridEl.rows[row].cells[col]) {
              gridEl.rows[row].cells[col].blockId = newBlockId;
              newBlock.meta = { 
                ...newBlock.meta, 
                layout: { ...(newBlock.meta?.layout || {}), grid_id: parentElementId, grid_position: targetPosition as GridPosition }
              };
              parentFoundAndUpdated = true;
              return gridEl;
            } else {
              console.error("Target cell not found in grid or grid structure incomplete:", parentElementId, targetPosition, gridEl);
            }
          } else if (el.type === 'row' && el.columns && typeof targetPosition === 'number') {
             const rowEl = el as LayoutElement & { type: 'row', columns: LayoutColumn[] };
             const columnIndex = targetPosition as number;
             if (rowEl.columns[columnIndex]) {
                const newElementInColumn: ElementDefinition = { id: generateId(), type: 'block', blockId: newBlockId, settings: {} };
                // Ensure elements array exists on the column
                if (!rowEl.columns[columnIndex].elements) {
                    rowEl.columns[columnIndex].elements = [];
                }
                rowEl.columns[columnIndex].elements.push(newElementInColumn);
                newBlock.meta = {
                    ...newBlock.meta,
                    layout: { ...(newBlock.meta?.layout || {}), row_id: parentElementId, position: columnIndex } // Simplified, might need more detail
                };
                parentFoundAndUpdated = true;
                return rowEl;
             } else {
                console.error("Target column not found in row:", parentElementId, targetPosition);
             }
          } else {
            console.warn("Unhandled parent type for block addition or mismatched targetPosition:", el.type);
          }
        }
        return el;
      });

      if (parentFoundAndUpdated) {
        finalBlocks[newBlockId] = newBlock;
        success = true;
      } else {
        console.warn("Could not add block to specified parent element:", parentElementId);
        return null; // Indicate failure, block not added to map or elements
      }
    } else {
      // Add as a new top-level LayoutElement of type 'block_container'
      finalBlocks[newBlockId] = newBlock; // Add block to map first
      const newLayoutElement: LayoutElement = {
        id: generateId(),
        type: 'block_container',
        blockId: newBlockId,
      };
      if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= finalElements.length) {
        finalElements.splice(insertAtIndex, 0, newLayoutElement);
      } else {
        finalElements.push(newLayoutElement);
      }
      success = true;
    }
    
    if (success) {
      updateStateAndHistory(finalElements, finalBlocks);
      setActiveBlockId(newBlockId);
      return newBlockId;
    }
    return null; // Should not be reached if logic is correct, implies failure
  }, [elements, blocks, updateStateAndHistory, setActiveBlockId]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    // ... keep existing code
    if (!blocks[blockId]) return;
    const newBlocks = {
      ...blocks,
      [blockId]: { ...blocks[blockId], ...updates, meta: { ...blocks[blockId].meta, ...updates.meta } }
    };
    updateStateAndHistory(elements, newBlocks);
  }, [elements, blocks, updateStateAndHistory]);
  
  const updateElement = useCallback((elementId: string, updates: Partial<LayoutElement>) => {
    // ... keep existing code
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateStateAndHistory(newElements, blocks);
  }, [elements, blocks, updateStateAndHistory]);


  const deleteBlock = useCallback((blockId: string) => {
    // ... keep existing code for removing block from blocks map
    const { [blockId]: _deletedBlock, ...remainingBlocks } = blocks;
    
    let newElements = [...elements];
    
    // Filter out top-level block_container elements
    newElements = newElements.filter(el => el.type !== 'block_container' || el.blockId !== blockId);

    // Recursively nullify blockId in nested structures (grids, rows > columns)
    function clearBlockIdRecursively(currentElements: LayoutElement[]): LayoutElement[] {
        return currentElements.map(el => {
            let newEl = { ...el };
            if (newEl.type === 'block_container' && newEl.blockId === blockId) {
                // This case should ideally be filtered out earlier if it's a top-level element.
                // If it's nested (though 'block_container' is mainly for top-level), it should be removed or its blockId nulled.
                // For simplicity, we assume 'block_container' is top-level and handled by the filter.
                // If a 'block' ElementDefinition is found in a column, it should be removed.
                return null; // Mark for removal, will be filtered out later
            } else if (newEl.type === 'row' && newEl.columns) {
                newEl.columns = newEl.columns.map(col => {
                    const updatedColElements = col.elements ? 
                        (clearBlockIdRecursively(col.elements.filter(e => e.type !== 'block' || e.blockId !== blockId) as LayoutElement[]) as ElementDefinition[])
                        : [];
                    return { ...col, elements: updatedColElements };
                }).filter(col => col.elements.length > 0 || Object.keys(col.settings || {}).length > 0 ); // Keep column if it has elements or settings
                 // If all columns become empty and row has no specific settings, row could also be removed.
                 if (newEl.columns.length === 0 && !Object.keys(newEl.settings || {}).length) return null;

            } else if (newEl.type === 'grid' && newEl.rows) {
                newEl.rows = newEl.rows.map(r => ({
                    ...r,
                    cells: r.cells.map(cell => cell.blockId === blockId ? { ...cell, blockId: null } : cell)
                }));
                // Potentially remove grid if all cells become empty and it has no specific settings.
                // const isEmptyGrid = newEl.rows.every(r => r.cells.every(c => !c.blockId));
                // if (isEmptyGrid && !Object.keys(newEl.settings || {}).length) return null;
            }
            return newEl;
        }).filter(el => el !== null) as LayoutElement[];
    }
    
    newElements = clearBlockIdRecursively(newElements);

    updateStateAndHistory(newElements, remainingBlocks);
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [elements, blocks, activeBlockId, updateStateAndHistory, setActiveBlockId]);

  const moveElement = useCallback((elementId: string, direction: 'up' | 'down') => {
    // ... keep existing code
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return;

    const newElements = [...elements];
    const targetIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;

    if (targetIndex < 0 || targetIndex >= newElements.length) return;

    [newElements[elementIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[elementIndex]];
    updateStateAndHistory(newElements, blocks);
  }, [elements, blocks, updateStateAndHistory]);

  const setElementsState = useCallback((newElements: LayoutElement[]) => {
    // ... keep existing code
     updateStateAndHistory(newElements, blocks);
  }, [blocks, updateStateAndHistory]);

  const setBlocksState = useCallback((newBlocks: { [key: string]: ReviewBlock }) => {
    // ... keep existing code
      updateStateAndHistory(elements, newBlocks);
  }, [elements, updateStateAndHistory]);


  const undo = useCallback(() => {
    // ... keep existing code
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const prevState = history.current[historyIndex.current];
      setInternalElements(prevState.elements);
      setInternalBlocks(prevState.blocks);
      if (onStateChange) onStateChange(prevState.elements, prevState.blocks);
      setActiveBlockIdState(null); // Reset active block on undo/redo
    }
  }, [onStateChange]);

  const redo = useCallback(() => {
    // ... keep existing code
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      const nextState = history.current[historyIndex.current];
      setInternalElements(nextState.elements);
      setInternalBlocks(nextState.blocks);
      if (onStateChange) onStateChange(nextState.elements, nextState.blocks);
      setActiveBlockIdState(null); // Reset active block on undo/redo
    }
  }, [onStateChange]);

  return {
    elements,
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveElement,
    updateElement,
    setElements: setElementsState,
    setBlocks: setBlocksState,
    undo,
    redo,
    canUndo: historyIndex.current > 0 && history.current.length > 1, // Ensure there's something to undo to
    canRedo: historyIndex.current < history.current.length - 1,
  };
};
