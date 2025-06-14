
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
      sort_index: -1, // Will be re-indexed later
      visible: true,
      meta: {},
    };

    if (options.targetPosition && typeof options.targetPosition === 'object') {
        newBlock.meta = {
            ...newBlock.meta,
            layout: {
                ...newBlock.meta?.layout,
                grid_position: {
                    row: options.targetPosition.row,
                    column: options.targetPosition.column,
                }
            }
        };
    }
    
    const newBlocks = { ...blocks, [newBlockId]: newBlock };
    
    // This is a simplified insertion logic. A real implementation
    // would need to traverse the elements tree to find the correct
    // parent and insertion point.
    const newLayoutElement: LayoutElement = {
      type: 'block_container',
      id: generateId(),
      blockId: newBlockId,
    };
    const newElements = [...elements, newLayoutElement];

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
    
    // Also remove from elements tree
    const filterElements = (els: ElementDefinition[]): ElementDefinition[] => {
        return els.filter(el => {
            if (el.type === 'block_container' && el.blockId === blockId) return false;
            if ('columns' in el && el.columns) {
                el.columns.forEach(c => c.elements = filterElements(c.elements));
            }
            if ('rows' in el && el.rows) {
                // Logic for 2D grids would be more complex
            }
            return true;
        })
    }
    
    const newElements = filterElements([...elements]) as LayoutElement[];

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
