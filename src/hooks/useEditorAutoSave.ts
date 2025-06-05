
// ABOUTME: Auto-save functionality for the native editor
// Provides debounced saving with error handling and status tracking

import { useCallback, useEffect, useState } from 'react';
import { ReviewBlock } from '@/types/review';

interface UseEditorAutoSaveOptions {
  data: ReviewBlock[];
  onSave?: (blocks: ReviewBlock[]) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export const useEditorAutoSave = ({ 
  data, 
  onSave, 
  interval = 30000, 
  enabled = true 
}: UseEditorAutoSaveOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = useCallback(async (silent = false) => {
    if (!onSave || !enabled) return;
    
    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      if (!silent) {
        console.log('Blocks saved successfully');
      }
    } catch (error) {
      console.error('Error saving blocks:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave, enabled]);

  // Auto-save functionality
  useEffect(() => {
    if (!enabled || !onSave) return;
    
    const autoSaveInterval = setInterval(() => {
      if (data.length > 0 && !isSaving) {
        handleSave(true); // Silent save
      }
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [data, isSaving, handleSave, interval, enabled, onSave]);

  return {
    handleSave,
    isSaving,
    lastSaved
  };
};
