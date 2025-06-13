
// ABOUTME: Editor layout management hook for responsive design
// Handles layout modes and responsive behavior

import { useState, useCallback } from 'react';

export const useEditorLayout = () => {
  const [isDividirMode, setIsDividirMode] = useState(false);

  const getEditorStyles = useCallback(() => {
    return {
      width: isDividirMode ? '100%' : 'auto',
      maxWidth: isDividirMode ? 'none' : '1200px'
    };
  }, [isDividirMode]);

  const toggleDividirMode = useCallback(() => {
    setIsDividirMode(prev => !prev);
  }, []);

  return {
    isDividirMode,
    getEditorStyles,
    toggleDividirMode
  };
};
