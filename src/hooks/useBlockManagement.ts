// ABOUTME: Enhanced block management hook for a nested list of LayoutElements.
// Manages block operations, undo/redo, and tree manipulation.
import { useState, useCallback } from 'react';
import { ReviewBlock, BlockType, LayoutElement, GridPosition, AddBlockOptions } from '@/types/review';
import { generateId } from '@/lib/utils';

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

// Helper function to recursively traverse and map elements in the tree
const mapElementsTree = (elements: LayoutElement[], callback: (el: LayoutElement) => LayoutElement): LayoutElement[] => {
    return elements.map(element => {
        let newElement = { ...element };

        if (newElement.columns) {
            newElement.columns = newElement.columns.map(column => ({
                ...column,
                elements: mapElementsTree(column.elements, callback)
            }));
        }
        
        // This is a placeholder for 2D grid traversal if needed later
        if (newElement.rows) {
            // Deeper traversal logic for 2D grids can be added here
        }
        
        return callback(newElement);
    });
};


export const useBlockManagement = (
  initialElements: LayoutElement[] = [],
  initialBlocks: { [key:string]: ReviewBlock } = {},
  historyLimit = 100
): UseBlockManagementReturn => {
  const [history, setHistory] = useState<BlockManagementHistory[]>([{ elements: initialElements, blocks: initialBlocks }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const elements = history[historyIndex].elements;
  const blocks = history[historyIndex].blocks;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const updateState = (newElements: LayoutElement[], newBlocks: { [key: string]: ReviewBlock }) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: newElements, blocks: newBlocks });
    if (newHistory.length > historyLimit) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const setElements = (newElements: LayoutElement[]) => {
      updateState(newElements, blocks);
  }

  const setBlocks = (newBlocks: { [key: string]: ReviewBlock }) => {
      updateState(elements, newBlocks);
  }

  const undo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [canUndo, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [canRedo, historyIndex]);

  const addBlock = useCallback((options: AddBlockOptions): string | null => {
    const newBlockId = generateId();
    const newBlock: ReviewBlock = {
      id: newBlockId,
      type: options.type,
      content: options.initialContent || {},
      sort_index: -1, // sort_index is less relevant in a tree, but kept for compatibility
      visible: true,
      meta: {},
    };

    const newLayoutElement: LayoutElement = {
      type: 'block_container',
      id: generateId(),
      blockId: newBlockId,
    };
    
    let newElements = [...elements];
    const newBlocks = { ...blocks, [newBlockId]: newBlock };

    // If a parent is specified, insert into it
    if (options.parentElementId) {
        newElements = mapElementsTree(newElements, (el) => {
            if (el.id === options.parentElementId) {
                const newEl = { ...el };
                // Handle insertion into a 2D grid cell
                if (newEl.type === 'grid' && options.targetPosition && typeof options.targetPosition !== 'number') {
                    const { row, column } = options.targetPosition;
                    if (newEl.rows && newEl.rows[row] && newEl.rows[row].cells[column]) {
                        // We need a new block and to update the cell
                        newEl.rows[row].cells[column].blockId = newBlockId;
                        newBlock.meta = { ...newBlock.meta, layout: { grid_position: { row, column }}};
                    }
                }
                // Handle insertion into a column (simplified: add to first column)
                else if (newEl.type === 'row' && newEl.columns && newEl.columns.length > 0) {
                    const targetColumnIndex = (typeof options.targetPosition === 'number') ? options.targetPosition : 0;
                    if (newEl.columns[targetColumnIndex]) {
                       newEl.columns[targetColumnIndex].elements.push(newLayoutElement);
                    }
                }
                return newEl;
            }
            return el;
        });
    } else if (options.relativeToLayoutElementId) {
        const targetIndex = newElements.findIndex(el => el.id === options.relativeToLayoutElementId);
        if (targetIndex !== -1) {
            const insertIndex = options.position === 'above' ? targetIndex : targetIndex + 1;
            newElements.splice(insertIndex, 0, newLayoutElement);
        } else {
            newElements.push(newLayoutElement); // Fallback
        }
    } else {
        const insertIndex = options.insertAtIndex ?? newElements.length;
        newElements.splice(insertIndex, 0, newLayoutElement);
    }

    updateState(newElements, newBlocks);
    setActiveBlockId(newBlockId);
    return newBlockId;

  }, [elements, blocks, historyIndex]);

  const updateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    if (!blocks[blockId]) return;
    const newBlocks = {
      ...blocks,
      [blockId]: { ...blocks[blockId], ...updates },
    };
    updateState(elements, newBlocks);
  }, [elements, blocks, historyIndex]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = { ...blocks };
    delete newBlocks[blockId];
    
    const removeBlockFromElements = (els: LayoutElement[]): LayoutElement[] => {
        let elsWithBlocksRemoved = els.map(el => {
            const newEl = {...el};
            if (newEl.columns) {
                newEl.columns = newEl.columns.map(c => ({
                    ...c,
                    elements: removeBlockFromElements(c.elements)
                }));
            }
            if (newEl.rows) {
                newEl.rows = newEl.rows.map(r => ({
                    ...r,
                    cells: r.cells.map(cell => {
                        if (cell.blockId === blockId) {
                            return { ...cell, blockId: null };
                        }
                        return cell;
                    })
                }));
            }
            return newEl;
        });

        return elsWithBlocksRemoved.filter(el => {
            return !(el.type === 'block_container' && el.blockId === blockId);
        });
    }
    
    const newElements = removeBlockFromElements([...elements]);

    updateState(newElements, newBlocks);
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [elements, blocks, activeBlockId, historyIndex]);

  const moveElement = useCallback((elementId: string, direction: 'up' | 'down') => {
      const index = elements.findIndex(el => el.id === elementId);
      if (index === -1) return;

      const newElements = [...elements];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newElements.length) {
          const [movedElement] = newElements.splice(index, 1);
          newElements.splice(targetIndex, 0, movedElement);
          updateState(newElements, blocks);
      }
  }, [elements, blocks, historyIndex]);

  const updateElement = useCallback((elementId: string, updates: Partial<LayoutElement>) => {
      const index = elements.findIndex(el => el.id === elementId);
      if (index === -1) return;
      
      const newElements = [...elements];
      newElements[index] = { ...newElements[index], ...updates };
      updateState(newElements, blocks);

  }, [elements, blocks, historyIndex]);

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
    setElements,
    setBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
