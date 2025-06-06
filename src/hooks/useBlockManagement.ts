// ABOUTME: Enhanced block management with complete 2D grid support
// Handles block operations for both 1D and 2D grid layouts

import { useState, useCallback, useMemo } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { GridPosition } from '@/types/grid';

interface UseBlockManagementProps {
  initialBlocks?: ReviewBlock[];
  issueId?: string;
}

interface BlockHistory {
  blocks: ReviewBlock[];
  timestamp: number;
}

export const useBlockManagement = ({ 
  initialBlocks = [], 
  issueId 
}: UseBlockManagementProps) => {
  const [blocks, setBlocks] = useState<ReviewBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [history, setHistory] = useState<BlockHistory[]>([
    { blocks: initialBlocks, timestamp: Date.now() }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save state to history
  const saveToHistory = useCallback((newBlocks: ReviewBlock[]) => {
    const newHistoryEntry = { blocks: newBlocks, timestamp: Date.now() };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryEntry);
    
    // Keep only last 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  // Generate unique block ID
  const generateBlockId = useCallback((): number => {
    return -(Date.now() + Math.random());
  }, []);

  // Add new block
  const addBlock = useCallback((type: BlockType, position?: number) => {
    const newBlock: ReviewBlock = {
      id: generateBlockId(),
      type,
      content: getDefaultContent(type),
      sort_index: position ?? blocks.length,
      visible: true,
      issue_id: issueId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBlocks(prevBlocks => {
      let newBlocks;
      if (position !== undefined) {
        // Insert at specific position
        newBlocks = [...prevBlocks];
        newBlocks.splice(position, 0, newBlock);
        
        // Update sort indices
        newBlocks.forEach((block, index) => {
          block.sort_index = index;
        });
      } else {
        // Add at end
        newBlocks = [...prevBlocks, newBlock];
      }
      
      saveToHistory(newBlocks);
      return newBlocks;
    });

    console.log('Added block:', { type, position, blockId: newBlock.id });
    return newBlock.id;
  }, [blocks.length, issueId, generateBlockId, saveToHistory]);

  // Update block
  const updateBlock = useCallback((blockId: number, updates: Partial<ReviewBlock>) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              ...updates, 
              updated_at: new Date().toISOString() 
            }
          : block
      );
      
      saveToHistory(newBlocks);
      return newBlocks;
    });

    console.log('Updated block:', { blockId, updates });
  }, [saveToHistory]);

  // Delete block
  const deleteBlock = useCallback((blockId: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.filter(block => block.id !== blockId);
      
      // Update sort indices
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });
      
      saveToHistory(newBlocks);
      return newBlocks;
    });

    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }

    console.log('Deleted block:', blockId);
  }, [activeBlockId, saveToHistory]);

  // Move block
  const moveBlock = useCallback((blockId: number, direction: 'up' | 'down') => {
    setBlocks(prevBlocks => {
      const blockIndex = prevBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevBlocks;

      const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
      if (newIndex < 0 || newIndex >= prevBlocks.length) return prevBlocks;

      const newBlocks = [...prevBlocks];
      [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];
      
      // Update sort indices
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });
      
      saveToHistory(newBlocks);
      return newBlocks;
    });

    console.log('Moved block:', { blockId, direction });
  }, [saveToHistory]);

  // Duplicate block
  const duplicateBlock = useCallback((blockId: number) => {
    const originalBlock = blocks.find(b => b.id === blockId);
    if (!originalBlock) return;

    const duplicatedBlock: ReviewBlock = {
      ...originalBlock,
      id: generateBlockId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBlocks(prevBlocks => {
      const blockIndex = prevBlocks.findIndex(b => b.id === blockId);
      const newBlocks = [...prevBlocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
      
      // Update sort indices
      newBlocks.forEach((block, index) => {
        block.sort_index = index;
      });
      
      saveToHistory(newBlocks);
      return newBlocks;
    });

    console.log('Duplicated block:', { originalId: blockId, newId: duplicatedBlock.id });
    return duplicatedBlock.id;
  }, [blocks, generateBlockId, saveToHistory]);

  // Convert single block to 1D grid
  const convertToGrid = useCallback((blockId: number, columns: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const rowId = `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    updateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          row_id: rowId,
          position: 0,
          columns,
          gap: 4,
          columnWidths: Array(columns).fill(100 / columns)
        }
      }
    });

    console.log('Converted block to 1D grid:', { blockId, columns, rowId });
  }, [blocks, updateBlock]);

  // Convert single block to 2D grid
  const convertTo2DGrid = useCallback((blockId: number, columns: number, rows: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const gridId = `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    updateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          grid_id: gridId,
          grid_position: { row: 0, column: 0 },
          grid_rows: rows,
          columns,
          gap: 4,
          columnWidths: Array(columns).fill(100 / columns),
          rowHeights: Array(rows).fill(120)
        }
      }
    });

    console.log('Converted block to 2D grid:', { blockId, columns, rows, gridId });
  }, [blocks, updateBlock]);

  // Enhanced merge function for both 1D and 2D grids
  const mergeBlockIntoGrid = useCallback((
    draggedBlockId: number, 
    targetRowId: string, 
    targetPosition?: number
  ) => {
    console.log('Merge block into grid:', { draggedBlockId, targetRowId, targetPosition });

    const draggedBlock = blocks.find(b => b.id === draggedBlockId);
    if (!draggedBlock) {
      console.error('Dragged block not found:', draggedBlockId);
      return;
    }

    // Check if target is a 2D grid
    if (targetRowId.startsWith('grid-')) {
      console.log('Merging into 2D grid');
      
      // Find if there are any blocks in this grid to determine structure
      const gridBlocks = blocks.filter(b => b.meta?.layout?.grid_id === targetRowId);
      
      if (gridBlocks.length > 0) {
        // Get grid configuration from existing blocks
        const gridConfig = gridBlocks[0].meta?.layout;
        const columns = gridConfig?.columns || 2;
        const rows = gridConfig?.grid_rows || 2;
        
        // Find the next available position
        let targetGridPosition: GridPosition;
        
        if (targetPosition !== undefined) {
          // Convert linear position to grid position
          targetGridPosition = {
            row: Math.floor(targetPosition / columns),
            column: targetPosition % columns
          };
        } else {
          // Find first empty position
          targetGridPosition = { row: 0, column: 0 };
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
              const positionOccupied = gridBlocks.some(b => 
                b.meta?.layout?.grid_position?.row === r && 
                b.meta?.layout?.grid_position?.column === c
              );
              if (!positionOccupied) {
                targetGridPosition = { row: r, column: c };
                break;
              }
            }
            if (targetGridPosition.row === r) break;
          }
        }
        
        // Update the dragged block to be part of the 2D grid
        updateBlock(draggedBlockId, {
          meta: {
            ...draggedBlock.meta,
            layout: {
              ...gridConfig,
              grid_id: targetRowId,
              grid_position: targetGridPosition
            }
          }
        });
        
        console.log('Block merged into 2D grid:', { 
          blockId: draggedBlockId, 
          gridId: targetRowId, 
          position: targetGridPosition 
        });
        
      } else {
        console.error('No blocks found in target 2D grid to determine structure');
      }
      
      return;
    }

    // Handle 1D grid merge (existing logic)
    const targetBlocks = blocks.filter(b => b.meta?.layout?.row_id === targetRowId);
    const targetBlock = targetBlocks.find(b => (b.meta?.layout?.position ?? 0) === targetPosition);
    const targetRow = targetBlocks.length > 0 ? targetBlocks[0] : null;

    if (!targetRow) {
      console.error('Invalid merge target:', { 
        targetRowId, 
        targetBlock: { _type: typeof targetBlock, value: targetBlock?.id || 'undefined' },
        targetRow: { _type: typeof targetRow, value: targetRow?.id || 'undefined' }
      });
      return;
    }

    const rowLayout = targetRow.meta?.layout;
    if (!rowLayout) {
      console.error('Target row has no layout metadata');
      return;
    }

    // Calculate insertion position
    let insertPosition = targetPosition ?? targetBlocks.length;
    
    // Update dragged block to be part of the target grid
    updateBlock(draggedBlockId, {
      meta: {
        ...draggedBlock.meta,
        layout: {
          row_id: targetRowId,
          position: insertPosition,
          columns: rowLayout.columns,
          gap: rowLayout.gap,
          columnWidths: rowLayout.columnWidths
        }
      }
    });

    // Update positions of other blocks in the same row
    const updatedTargetBlocks = blocks.filter(b => 
      b.meta?.layout?.row_id === targetRowId && b.id !== draggedBlockId
    );

    updatedTargetBlocks.forEach(block => {
      const blockPosition = block.meta?.layout?.position ?? 0;
      if (blockPosition >= insertPosition) {
        updateBlock(block.id, {
          meta: {
            ...block.meta,
            layout: {
              ...block.meta?.layout,
              position: blockPosition + 1
            }
          }
        });
      }
    });

    console.log('Block merged into 1D grid:', { 
      blockId: draggedBlockId, 
      targetRowId, 
      insertPosition 
    });
  }, [blocks, updateBlock]);

  // Place block in 2D grid
  const placeBlockIn2DGrid = useCallback((
    blockId: number,
    gridId: string,
    position: GridPosition
  ) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Find grid configuration from existing blocks or use defaults
    const gridBlocks = blocks.filter(b => b.meta?.layout?.grid_id === gridId);
    const gridConfig = gridBlocks.length > 0 ? gridBlocks[0].meta?.layout : {
      columns: 2,
      grid_rows: 2,
      gap: 4,
      columnWidths: [50, 50],
      rowHeights: [120, 120]
    };

    updateBlock(blockId, {
      meta: {
        ...block.meta,
        layout: {
          ...gridConfig,
          grid_id: gridId,
          grid_position: position
        }
      }
    });

    console.log('Placed block in 2D grid:', { blockId, gridId, position });
  }, [blocks, updateBlock]);

  // History management
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex].blocks);
      console.log('Undo operation');
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks(history[newIndex].blocks);
      console.log('Redo operation');
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    convertToGrid,
    convertTo2DGrid,
    mergeBlockIntoGrid,
    placeBlockIn2DGrid,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

// Helper function to get default content for block types
function getDefaultContent(type: BlockType): any {
  switch (type) {
    case 'heading':
      return { text: 'Novo Título', level: 1 };
    case 'paragraph':
      return { text: 'Novo parágrafo...' };
    case 'list':
      return { items: ['Item 1'], ordered: false };
    case 'quote':
      return { text: 'Citação...', author: '' };
    case 'code':
      return { code: '// Código aqui', language: 'javascript' };
    case 'divider':
      return {};
    case 'figure':
      return { url: '', caption: '', alt: '' };
    case 'callout':
      return { text: 'Informação importante...', type: 'info' };
    case 'table':
      return { 
        headers: ['Coluna 1', 'Coluna 2'], 
        rows: [['Dados 1', 'Dados 2']] 
      };
    case 'citation_list':
      return { citations: [] };
    case 'poll':
      return { 
        question: 'Sua pergunta aqui?', 
        options: ['Opção 1', 'Opção 2'] 
      };
    case 'reviewer_quote':
      return { 
        text: 'Comentário do revisor...', 
        reviewer: 'Revisor', 
        rating: 5 
      };
    case 'snapshot_card':
      return { 
        title: 'Título do Card', 
        value: '100%', 
        evidence_level: 'high' 
      };
    case 'number_card':
      return { 
        title: 'Métrica', 
        value: '42', 
        trend: 'up' 
      };
    default:
      return { text: 'Conteúdo padrão...' };
  }
}
