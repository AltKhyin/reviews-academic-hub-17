
// ABOUTME: Editor layout management hook with comprehensive layout modes and configurations
import { useState, useCallback } from 'react';

export type LayoutMode = 'list' | 'grid';

export const useEditorLayout = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('list');

  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(prev => prev === 'list' ? 'grid' : 'list');
  }, []);

  const isGridMode = layoutMode === 'grid';

  return {
    layoutMode,
    toggleLayoutMode,
    isGridMode,
    setLayoutMode
  };
};
