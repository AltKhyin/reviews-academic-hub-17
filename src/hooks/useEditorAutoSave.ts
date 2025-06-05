
// ABOUTME: Auto-save functionality for the native editor
// Provides debounced saving with error handling and status tracking

import { useCallback, useEffect, useState } from 'react';
import { ReviewBlock } from '@/types/review';

interface UseEditorAutoSaveOptions {
  blocks: ReviewBlock[];
  onSave: (blocks: ReviewBlock[]) => Promise<void>;
  interval?: number;
}

export const useEditorAutoSave = ({ blocks, onSave, interval = 30000 }: UseEditorAutoSaveOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = useCallback(async (silent = false) => {
    setIsSaving(true);
    try {
      await onSave(blocks);
      setLastSaved(new Date());
      if (!silent) {
        console.log('Blocks saved successfully');
      }
    } catch (error) {
      console.error('Error saving blocks:', error);
    } finally {
      setIsSaving(false);
    }
  }, [blocks, onSave]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (blocks.length > 0 && !isSaving) {
        handleSave(true); // Silent save
      }
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [blocks, isSaving, handleSave, interval]);

  return {
    handleSave,
    isSaving,
    lastSaved
  };
};
