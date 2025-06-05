
// ABOUTME: Block history management for undo/redo functionality
// Handles state history, undo/redo operations with efficient memory management

import { useCallback, useState } from 'react';
import { ReviewBlock } from '@/types/review';

interface BlockHistoryState {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
}

export const useBlockHistory = (initialBlocks: ReviewBlock[]) => {
  const [history, setHistory] = useState<BlockHistoryState[]>([
    { blocks: initialBlocks, activeBlockId: null }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const saveToHistory = useCallback((newBlocks: ReviewBlock[], newActiveBlockId: number | null) => {
    const newState: BlockHistoryState = {
      blocks: JSON.parse(JSON.stringify(newBlocks)), // Deep clone
      activeBlockId: newActiveBlockId
    };

    // Remove any future history if we're in the middle
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Limit history to last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [canRedo, historyIndex, history]);

  return {
    history,
    historyIndex,
    canUndo,
    canRedo,
    saveToHistory,
    undo,
    redo
  };
};
