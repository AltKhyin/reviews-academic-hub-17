
// ABOUTME: Grid repair utilities for fixing layout metadata inconsistencies  
// Provides validation and repair functions for grid layouts

import { useCallback } from 'react';
import { ReviewBlock } from '@/types/review';

interface UseGridRepairProps {
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
}

export const useGridRepair = ({ onUpdateBlock }: UseGridRepairProps) => {
  
  const validateLayoutMetadata = useCallback((blocks: ReviewBlock[]) => {
    const issues: string[] = [];
    
    blocks.forEach(block => {
      const layout = block.meta?.layout;
      if (layout?.row_id) {
        // Check for valid column widths
        if (layout.columnWidths && layout.columns) {
          if (layout.columnWidths.length !== layout.columns) {
            issues.push(`Block ${block.id}: columnWidths length doesn't match columns`);
          }
          
          const totalWidth = layout.columnWidths.reduce((sum, width) => sum + width, 0);
          if (Math.abs(totalWidth - 100) > 0.1) {
            issues.push(`Block ${block.id}: columnWidths don't sum to 100%`);
          }
        }
      }
      
      if (layout?.grid_id && layout?.grid_position) {
        // Validate 2D grid position
        if (layout.grid_position.row < 0 || layout.grid_position.column < 0) {
          issues.push(`Block ${block.id}: invalid grid position`);
        }
      }
    });
    
    return issues;
  }, []);

  const repairLayoutMetadata = useCallback((rowId: string, blocks: ReviewBlock[]) => {
    console.log('Repairing layout metadata for row:', rowId);
    
    if (blocks.length === 0) return;
    
    // Ensure equal column widths
    const columns = blocks.length;
    const equalWidth = 100 / columns;
    const columnWidths = Array(columns).fill(equalWidth);
    
    blocks.forEach((block, index) => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            row_id: rowId,
            columns,
            columnWidths,
            position: index
          }
        }
      });
    });
  }, [onUpdateBlock]);

  return {
    validateLayoutMetadata,
    repairLayoutMetadata
  };
};
