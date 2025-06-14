// ABOUTME: Enhanced block management hook for a flat list of ReviewBlocks.
// Manages block operations, undo/redo.
import { useState, useCallback, useRef, useEffect } from 'react';
import { ReviewBlock, BlockType, LayoutConfig, Review, LayoutElement, GridPosition, LayoutRowDefinition, ElementDefinition, LayoutColumn, AddBlockOptions } from '@/types/review'; // Added Review, LayoutElement, GridPosition, LayoutRowDefinition
import { generateId } from '@/lib/utils'; // Assuming generateId is in utils

export interface UseBlockManagementReturn {
  elements: LayoutElement[];
  blocks: { [key: string]: ReviewBlock };
  activeBlockId: string | null;
  setActiveBlockId: (blockId: string | null) => void;
  addBlock: (options: AddBlockOptions) => string | null; // Returns new block ID or null if error
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
  onStateChange?: (newElements: LayoutElement[], newBlocks: { [key:string]: ReviewBlock }) => void
): UseBlockManagementReturn => {
  const [elements, setInternalElements] = useState<LayoutElement[]>(initialElements);
  const [blocks, setInternalBlocks] = useState<{ [key: string]: ReviewBlock }>(initialBlocks);
  const [activeBlockId, setActiveBlockIdState] = useState<string | null>(null);

  const history = useRef<BlockManagementHistory[]>([]);
  const historyIndex = useRef(-1);

  const updateStateAndHistory = useCallback((newElements: LayoutElement[], newBlocks: { [key: string]: ReviewBlock }) => {
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

  const addBlock = useCallback((options: AddBlockOptions): string | null => {
    const { 
      type, 
      initialContent = {}, 
      parentElementId, 
      targetPosition, 
      relativeToLayoutElementId, 
      position 
    } = options;
    let { insertAtIndex } = options;

    // Handle relative positioning to calculate insertAtIndex for root elements
    if (relativeToLayoutElementId && position && !parentElementId) {
        const relativeIndex = elements.findIndex(el => el.id === relativeToLayoutElementId);
        if (relativeIndex !== -1) {
            insertAtIndex = position === 'above' ? relativeIndex : relativeIndex + 1;
        } else {
            console.warn(`Could not find relative element with ID: ${relativeToLayoutElementId}. Appending to the end.`);
            insertAtIndex = elements.length;
        }
    }

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
    const newBlocks = { ...blocks, [newBlockId]: newBlock };

    if (parentElementId) {
        let parentFoundAndUpdated = false;

        const addRecursively = (currentElements: ElementDefinition[]): ElementDefinition[] => {
            return currentElements.map(el => {
                if (el.type === 'block') return el;

                if (el.id === parentElementId && el.type === 'grid' && typeof targetPosition === 'object' && targetPosition !== null && 'row' in targetPosition && 'col' in targetPosition) {
                    const gridEl = el as LayoutElement & { type: 'grid', rows: LayoutRowDefinition[] };
                    const { row, col } = targetPosition as GridPosition;
                    if (gridEl.rows?.[row]?.cells?.[col]) {
                        const newGridEl = { ...gridEl, rows: [...gridEl.rows] };
                        newGridEl.rows[row] = { ...newGridEl.rows[row], cells: [...newGridEl.rows[row].cells] };
                        newGridEl.rows[row].cells[col] = { ...newGridEl.rows[row].cells[col], blockId: newBlockId };
                        
                        newBlock.meta = { ...newBlock.meta, layout: { ...(newBlock.meta?.layout || {}), grid_id: parentElementId, grid_position: targetPosition as GridPosition } };
                        parentFoundAndUpdated = true;
                        return newGridEl;
                    }
                }

                if (el.type === 'row' && el.columns) {
                    const newRowEl = { ...el, columns: [...el.columns] };
                    let columnUpdated = false;
                    newRowEl.columns = newRowEl.columns.map(col => {
                        if (col.id === parentElementId) {
                            columnUpdated = true;
                            const newCol = { ...col, elements: col.elements ? [...col.elements] : [] };
                            const newElementInColumn: ElementDefinition = { id: generateId(), type: 'block', blockId: newBlockId, settings: {} };

                            const insertionIndex = typeof targetPosition === 'number' ? targetPosition : newCol.elements.length;
                            newCol.elements.splice(insertionIndex, 0, newElementInColumn);
                            
                            newBlock.meta = { ...newBlock.meta, layout: { ...(newBlock.meta?.layout || {}), row_id: el.id, position: insertionIndex } };
                            return newCol;
                        }
                        return col;
                    });

                    if (columnUpdated) {
                        parentFoundAndUpdated = true;
                        return newRowEl;
                    }
                }
                
                return el;
            });
        };
        
        const finalElements = addRecursively(elements) as LayoutElement[];
        
        if (parentFoundAndUpdated) {
            success = true;
            updateStateAndHistory(finalElements, newBlocks);
        } else {
            console.warn("Could not add block to specified parent element:", parentElementId);
            return null;
        }

    } else {
      const finalElements = [...elements];
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
      updateStateAndHistory(finalElements, newBlocks);
    }
    
    if (success) {
      setActiveBlockId(newBlockId);
      return newBlockId;
    }
    return null;
  }, [elements, blocks, updateStateAndHistory, setActiveBlockId]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    if (!blocks[blockId]) return;
    const newBlocks = {
      ...blocks,
      [blockId]: { ...blocks[blockId], ...updates, meta: { ...blocks[blockId].meta, ...updates.meta } }
    };
    updateStateAndHistory(elements, newBlocks);
  }, [elements, blocks, updateStateAndHistory]);
  
  const updateElement = useCallback((elementId: string, updates: Partial<LayoutElement>) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateStateAndHistory(newElements, blocks);
  }, [elements, blocks, updateStateAndHistory]);


  const deleteBlock = useCallback((blockId: string) => {
    const { [blockId]: _deletedBlock, ...remainingBlocks } = blocks;
    
    const removeBlockReferenceRecursively = (currentElements: ElementDefinition[]): ElementDefinition[] => {
        return currentElements
            .filter(el => !(el.type === 'block' && el.blockId === blockId))
            .map(el => {
                if (el.type === 'row' && el.columns) {
                    const newEl = { ...el };
                    newEl.columns = el.columns.map(col => ({
                        ...col,
                        elements: removeBlockReferenceRecursively(col.elements || [])
                    }));
                    newEl.columns = newEl.columns.filter(col => col.elements.length > 0 || Object.keys(col.settings || {}).length > 0);
                    return newEl;
                }
                
                if (el.type === 'grid' && el.rows) {
                    const newEl = { ...el };
                    newEl.rows = el.rows.map(r => ({
                        ...r,
                        cells: r.cells.map(cell => cell.blockId === blockId ? { ...cell, blockId: null } : cell)
                    }));
                    return newEl;
                }
                
                return el;
            })
            .filter(el => {
                if (el.type === 'row' && (!el.columns || el.columns.length === 0)) {
                    return !!el.settings && Object.keys(el.settings).length > 0;
                }
                if (el.type === 'grid' && (!el.rows || el.rows.every(r => r.cells.every(c => !c.blockId)))) {
                    return !!el.settings && Object.keys(el.settings).length > 0;
                }
                return true;
            });
    };

    const newElements = removeBlockReferenceRecursively(elements) as LayoutElement[];
    const finalElements = newElements.filter(el => el.type !== 'block_container' || el.blockId !== blockId);

    updateStateAndHistory(finalElements, remainingBlocks);

    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [elements, blocks, activeBlockId, updateStateAndHistory, setActiveBlockId]);

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
      setActiveBlockIdState(null); // Reset active block on undo/redo
    }
  }, [onStateChange]);

  const redo = useCallback(() => {
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
    canUndo: historyIndex.current > 0 && history.current.length > 1,
    canRedo: historyIndex.current < history.current.length - 1,
  };
};
