
// ABOUTME: Grid layout repair and validation utilities
// Handles metadata validation and repair operations

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';

interface UseGridRepairProps {
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
}

export const useGridRepair = ({ onUpdateBlock }: UseGridRepairProps) => {
  const validateLayoutMetadata = useCallback((block: ReviewBlock): boolean => {
    const layout = block.meta?.layout;
    if (!layout) return true;
    
    const isValid = !!(layout.row_id && 
                      typeof layout.position === 'number' && 
                      typeof layout.columns === 'number' && 
                      layout.columns > 0);
    
    if (!isValid) {
      console.warn('Invalid layout metadata detected:', { blockId: block.id, layout });
    }
    
    return isValid;
  }, []);
  
  const repairLayoutMetadata = useCallback((rowId: string, blocks: ReviewBlock[]) => {
    console.log('Repairing layout metadata for row:', rowId);
    
    blocks.forEach((block, index) => {
      const currentLayout = block.meta?.layout;
      const expectedLayout = {
        row_id: rowId,
        position: index,
        columns: blocks.length,
        gap: currentLayout?.gap || 4,
        columnWidths: currentLayout?.columnWidths
      };
      
      if (!currentLayout || 
          currentLayout.row_id !== expectedLayout.row_id ||
          currentLayout.position !== expectedLayout.position ||
          currentLayout.columns !== expectedLayout.columns) {
        
        console.log('Updating block layout metadata:', { 
          blockId: block.id, 
          oldLayout: currentLayout, 
          newLayout: expectedLayout 
        });
        
        onUpdateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: expectedLayout
          }
        });
      }
    });
  }, [onUpdateBlock]);

  return {
    validateLayoutMetadata,
    repairLayoutMetadata
  };
};
