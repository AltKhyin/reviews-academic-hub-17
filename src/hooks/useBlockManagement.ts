
// ABOUTME: Enhanced block management hook for a flat list of ReviewBlocks.
// Manages block operations, undo/redo.
import { useState, useCallback, useRef, useEffect } from 'react';
import { ReviewBlock, BlockType, LayoutConfig, Review, LayoutElement } from '@/types/review'; // Added Review, LayoutElement
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
  // Add other layout-specific functions as needed, e.g., addElement, deleteElement
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
    // Ensure sort_index for blocks within elements (if applicable, less relevant for elements themselves)
    // This might be more complex depending on how sort_index is used with LayoutElements
    const newBlocksWithSortIndex = { ...newBlocks };
    Object.values(newBlocksWithSortIndex).forEach((block, index) => {
        // A global sort_index might not make sense if blocks are nested.
        // sort_index should ideally be relative to their container or managed by element order.
        // For now, let's assume sort_index is managed by array order of elements for top-level items.
        // If a block is directly in `elements` via a 'block_container' LayoutElement, its position is determined by LayoutElement order.
    });


    setInternalElements(newElements);
    setInternalBlocks(newBlocksWithSortIndex);

    if (onStateChange) {
      onStateChange(newElements, newBlocksWithSortIndex);
    }

    const currentHistoryState = { elements: newElements, blocks: newBlocksWithSortIndex };
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(currentHistoryState);
    historyIndex.current = history.current.length - 1;

  }, [onStateChange]);
  
  useEffect(() => { // Initialize history
    updateStateAndHistory(initialElements, initialBlocks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount with initial values


  const setActiveBlockId = useCallback((blockId: string | null) => {
    setActiveBlockIdState(blockId);
  }, []);

  const addBlock = useCallback((options: { 
    type: BlockType; 
    initialContent?: any; 
    parentElementId?: string; 
    targetPosition?: GridPosition | number;
    insertAtIndex?: number; // Index in the top-level elements array
  }): string | null => {
    const { type, initialContent = {}, parentElementId, targetPosition, insertAtIndex } = options;
    const newBlockId = generateId();
    const newBlock: ReviewBlock = {
      id: newBlockId,
      type,
      content: initialContent,
      sort_index: 0, // Will be determined by its position in elements or parent
      visible: true,
      meta: {},
    };

    let newElements = [...elements];
    const newBlocks = { ...blocks, [newBlockId]: newBlock };

    if (parentElementId) {
      // Logic to add block to a nested LayoutElement (e.g., a column in a row, or a cell in a grid)
      // This requires traversing the elements structure.
      // For example, find parentElementId, then find appropriate child array (columns > elements, or rows > cells)
      // And update blockId in that cell/column element.
      // This part is complex and depends on the exact LayoutElement structure.
      console.warn("addBlock to parentElementId not fully implemented in this simplified hook version.", parentElementId, targetPosition);
      // Placeholder: If parentElementId is a grid, update layout.grid_id in block.meta
      if (typeof targetPosition === 'object' && targetPosition !== null && 'row' in targetPosition && 'col' in targetPosition) { // GridPosition
         newBlocks[newBlockId].meta = { 
            ...newBlocks[newBlockId].meta, 
            layout: { ...newBlocks[newBlockId].meta?.layout, grid_id: parentElementId, grid_position: targetPosition }
         };
      }
       // Need to find the LayoutElement with parentElementId and update its structure
       // For now, just adding the block to the main 'blocks' map. The UI needs to handle rendering it.
    } else {
      // Add as a new top-level LayoutElement of type 'block_container'
      const newLayoutElement: LayoutElement = {
        id: generateId(),
        type: 'block_container',
        blockId: newBlockId,
      };
      if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= newElements.length) {
        newElements.splice(insertAtIndex, 0, newLayoutElement);
      } else {
        newElements.push(newLayoutElement);
      }
    }
    
    updateStateAndHistory(newElements, newBlocks);
    setActiveBlockId(newBlockId);
    return newBlockId;
  }, [elements, blocks, updateStateAndHistory]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    if (!blocks[blockId]) return;
    const newBlocks = {
      ...blocks,
      [blockId]: { ...blocks[blockId], ...updates, meta: { ...blocks[blockId].meta, ...updates.meta } }
    };
    updateStateAndHistory(elements, newBlocks); // Elements don't change, only block content
  }, [elements, blocks, updateStateAndHistory]);
  
  const updateElement = useCallback((elementId: string, updates: Partial<LayoutElement>) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateStateAndHistory(newElements, blocks); // Blocks don't change, only element structure/settings
  }, [elements, blocks, updateStateAndHistory]);


  const deleteBlock = useCallback((blockId: string) => {
    // Remove block from blocks map
    const { [blockId]: _deletedBlock, ...remainingBlocks } = blocks;
    
    // Remove/update LayoutElements that reference this blockId
    let newElements = [...elements];
    
    // Top-level elements
    newElements = newElements.filter(el => el.type !== 'block_container' || el.blockId !== blockId);

    // Nested elements (this requires recursive traversal and is complex)
    // Simplified: Assume for now block deletion primarily affects top-level or simple cases.
    // A more robust solution would recursively clean up blockId references.
    // For example, if a block is in a grid cell, that cell's blockId should be set to null.
    function clearBlockIdFromElements(els: ElementDefinition[]): ElementDefinition[] {
        return els.map(el => {
            if (el.type === 'block' && el.blockId === blockId) {
                return { ...el, blockId: undefined }; // Or remove the element if it's just a block wrapper
            } else if (el.type === 'row' && (el as LayoutElement).columns) {
                return { ...el, columns: (el as LayoutElement).columns!.map(col => ({ ...col, elements: clearBlockIdFromElements(col.elements) })) };
            } else if (el.type === 'grid' && (el as LayoutElement).rows) {
                return { ...el, rows: (el as LayoutElement).rows!.map(r => ({ ...r, cells: r.cells.map(cell => cell.blockId === blockId ? { ...cell, blockId: null } : cell) })) };
            }
            return el;
        }) as ElementDefinition[]; // Added 'as ElementDefinition[]'
    }
    newElements = clearBlockIdFromElements(newElements) as LayoutElement[];


    updateStateAndHistory(newElements, remainingBlocks);
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [elements, blocks, activeBlockId, updateStateAndHistory]);

  const moveElement = useCallback((elementId: string, direction: 'up' | 'down') => {
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return;

    const newElements = [...elements];
    const targetIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;

    if (targetIndex < 0 || targetIndex >= newElements.length) return;

    [newElements[elementIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[elementIndex]];
    updateStateAndHistory(newElements, blocks);
  }, [elements, blocks, updateStateAndHistory]);

  const setElementsState = useCallback((newElements: LayoutElement[]) => {
     updateStateAndHistory(newElements, blocks);
  }, [blocks, updateStateAndHistory]);

  const setBlocksState = useCallback((newBlocks: { [key: string]: ReviewBlock }) => {
      updateStateAndHistory(elements, newBlocks);
  }, [elements, updateStateAndHistory]);


  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const prevState = history.current[historyIndex.current];
      setInternalElements(prevState.elements);
      setInternalBlocks(prevState.blocks);
      if (onStateChange) onStateChange(prevState.elements, prevState.blocks);
      setActiveBlockIdState(null);
    }
  }, [onStateChange]);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      const nextState = history.current[historyIndex.current];
      setInternalElements(nextState.elements);
      setInternalBlocks(nextState.blocks);
      if (onStateChange) onStateChange(nextState.elements, nextState.blocks);
      setActiveBlockIdState(null);
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
    canUndo: historyIndex.current > 0,
    canRedo: historyIndex.current < history.current.length - 1,
  };
};
