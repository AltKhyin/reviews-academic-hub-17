
// ABOUTME: Editor layout management for responsive editing modes
// Handles dynamic width adjustments based on view mode selection

import { useState, useEffect, useCallback } from 'react';

type ViewMode = 'single' | 'dividir' | 'preview';

interface EditorLayoutConfig {
  editorWidth: string;
  previewWidth: string;
  showPreview: boolean;
  transition: string;
}

const LAYOUT_CONFIGS: Record<ViewMode, EditorLayoutConfig> = {
  single: {
    editorWidth: '100%',
    previewWidth: '0%',
    showPreview: false,
    transition: 'all 0.3s ease-in-out'
  },
  dividir: {
    editorWidth: '65%',
    previewWidth: '35%', 
    showPreview: true,
    transition: 'all 0.3s ease-in-out'
  },
  preview: {
    editorWidth: '0%',
    previewWidth: '100%',
    showPreview: true,
    transition: 'all 0.3s ease-in-out'
  }
};

export const useEditorLayout = () => {
  const [currentMode, setCurrentMode] = useState<ViewMode>('single');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current layout configuration
  const layoutConfig = LAYOUT_CONFIGS[currentMode];

  // Change view mode with transition
  const changeViewMode = useCallback((newMode: ViewMode) => {
    if (newMode === currentMode) return;

    console.log('Changing editor layout mode:', { from: currentMode, to: newMode });

    setIsTransitioning(true);
    setCurrentMode(newMode);

    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentMode]);

  // Auto-detect mode changes from external components
  useEffect(() => {
    const handleViewModeChange = (event: CustomEvent) => {
      const { mode } = event.detail;
      if (mode && mode !== currentMode) {
        changeViewMode(mode);
      }
    };

    // Listen for custom view mode change events
    window.addEventListener('viewModeChange', handleViewModeChange as EventListener);

    return () => {
      window.removeEventListener('viewModeChange', handleViewModeChange as EventListener);
    };
  }, [currentMode, changeViewMode]);

  // Helper to trigger mode change from components
  const triggerViewModeChange = useCallback((mode: ViewMode) => {
    const event = new CustomEvent('viewModeChange', {
      detail: { mode }
    });
    window.dispatchEvent(event);
  }, []);

  // Get CSS styles for editor container
  const getEditorStyles = useCallback((): React.CSSProperties => {
    return {
      width: layoutConfig.editorWidth,
      transition: layoutConfig.transition,
      overflow: 'hidden'
    };
  }, [layoutConfig]);

  // Get CSS styles for preview container
  const getPreviewStyles = useCallback((): React.CSSProperties => {
    return {
      width: layoutConfig.previewWidth,
      transition: layoutConfig.transition,
      overflow: 'hidden',
      display: layoutConfig.showPreview ? 'block' : 'none'
    };
  }, [layoutConfig]);

  // Check if current mode is "dividir"
  const isDividirMode = currentMode === 'dividir';

  // Check if preview should be shown
  const shouldShowPreview = layoutConfig.showPreview;

  return {
    currentMode,
    changeViewMode,
    triggerViewModeChange,
    getEditorStyles,
    getPreviewStyles,
    isDividirMode,
    shouldShowPreview,
    isTransitioning,
    layoutConfig
  };
};
