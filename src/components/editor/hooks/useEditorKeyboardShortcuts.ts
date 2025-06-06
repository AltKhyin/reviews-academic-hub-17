
// ABOUTME: Keyboard shortcuts hook for native editor
// Handles all keyboard shortcuts and key bindings

import { useCallback, useEffect } from 'react';

interface UseEditorKeyboardShortcutsProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const useEditorKeyboardShortcuts = ({
  onSave,
  onUndo,
  onRedo
}: UseEditorKeyboardShortcutsProps) => {
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          onSave();
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            onRedo();
          } else {
            e.preventDefault();
            onUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          onRedo();
          break;
      }
    }
  }, [onSave, onUndo, onRedo]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);
};
