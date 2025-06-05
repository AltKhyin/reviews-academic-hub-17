// ABOUTME: Unified block editor with resizable grid controls and enhanced layout management
// Features draggable dividers for dynamic column proportions and improved preview rendering

import React, { useState, useCallback, useRef } from 'react';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { DragHandle } from './DragHandle';
import { ResizableGrid } from './layout/ResizableGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Columns2,
  Columns3,
  Columns4,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId: number | null;
  onActiveBlockChange: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (blockId: number, direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock: (blockId: number) => void;
  onConvertToGrid?: (blockId: number, columns: number) => void;
  className?: string;
}

interface LayoutRow {
  id: string;
  blocks: ReviewBlock[];
  columns: number;
  gap: number;
  columnWidths?: number[];
}

interface DragState {
  draggedBlockId: number | null;
  draggedFromRowId: string | null;
  dragOverRowId: string | null;
  dragOverPosition: number | null;
  isDragging: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  activeBlockId,
  onActiveBlockChange,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onAddBlock,
  onDuplicateBlock,
  onConvertToGrid,
  className
}) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedBlockId: null,
    draggedFromRowId: null,
    dragOverRowId: null,
    dragOverPosition: null,
    isDragging: false
  });

  const dragTimeoutRef = useRef<NodeJS.Timeout>();

  // Group blocks into layout rows with enhanced metadata
  const layoutRows: LayoutRow[] = React.useMemo(() => {
    const rows: Map<string, LayoutRow> = new Map();
    const processedBlocks = new Set<number>();

    // Sort blocks by sort_index to maintain order
    const sortedBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);

    console.log('Computing layout rows from blocks:', sortedBlocks.length);

    sortedBlocks.forEach((block) => {
      if (processedBlocks.has(block.id)) return;

      const blockLayout = block.meta?.layout;
      
      if (blockLayout?.row_id && typeof blockLayout.row_id === 'string') {
        // Block belongs to a multi-column row
        const rowId = blockLayout.row_id;
        
        if (!rows.has(rowId)) {
          rows.set(rowId, {
            id: rowId,
            blocks: [],
            columns: blockLayout.columns || 1,
            gap: blockLayout.gap || 4,
            columnWidths: blockLayout.columnWidths
          });
        }
        
        const row = rows.get(rowId)!;
        row.blocks.push(block);
        processedBlocks.add(block.id);
        
        // Update row metadata from latest block
        if (blockLayout.columnWidths) {
          row.columnWidths = blockLayout.columnWidths;
        }
        
        console.log('Added block to grid row:', { 
          blockId: block.id, 
          rowId, 
          position: blockLayout.position,
          totalInRow: row.blocks.length 
        });
      } else {
        // Single block row
        const singleRowId = `single-${block.id}`;
        rows.set(singleRowId, {
          id: singleRowId,
          blocks: [block],
          columns: 1,
          gap: 4
        });
        processedBlocks.add(block.id);
        
        console.log('Added single block row:', { blockId: block.id, rowId: singleRowId });
      }
    });

    // Convert to array and sort by minimum sort_index
    const result = Array.from(rows.values())
      .filter(row => row.blocks.length > 0)
      .map(row => ({
        ...row,
        blocks: row.blocks.sort((a, b) => {
          const aPos = a.meta?.layout?.position ?? 0;
          const bPos = b.meta?.layout?.position ?? 0;
          return aPos - bPos;
        })
      }))
      .sort((a, b) => {
        const aMinSort = Math.min(...a.blocks.map(b => b.sort_index));
        const bMinSort = Math.min(...b.blocks.map(b => b.sort_index));
        return aMinSort - bMinSort;
      });

    console.log('Layout rows computed:', { 
      totalRows: result.length,
      gridRows: result.filter(r => r.columns > 1).length,
      singleRows: result.filter(r => r.columns === 1).length
    });
    
    return result;
  }, [blocks]);

  const handleBlockClick = useCallback((blockId: number, event: React.MouseEvent) => {
    const target = event.target as Element;
    const isInteractiveElement = target.closest('.inline-editor-display, .inline-rich-editor-display, input, textarea, button, select');
    
    if (!isInteractiveElement) {
      onActiveBlockChange(activeBlockId === blockId ? null : blockId);
    }
  }, [activeBlockId, onActiveBlockChange]);

  const handleBlockVisibilityToggle = useCallback((blockId: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      onUpdateBlock(blockId, { visible: !block.visible });
    }
  }, [blocks, onUpdateBlock]);

  const addBlockBetween = useCallback((position: number, type: BlockType = 'paragraph') => {
    onAddBlock(type, position);
  }, [onAddBlock]);

  // Enhanced grid conversion with proper validation and feedback
  const convertToLayout = useCallback((blockId: number, columns: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) {
      console.error('Block not found for grid conversion:', blockId);
      return;
    }

    if (block.meta?.layout?.row_id) {
      console.warn('Block is already in a grid layout:', blockId);
      return;
    }

    console.log('Converting block to grid layout:', { blockId, columns, blockType: block.type });
    
    if (onConvertToGrid) {
      onConvertToGrid(blockId, columns);
    } else {
      console.error('onConvertToGrid handler not provided');
    }
  }, [blocks, onConvertToGrid]);

  const addBlockToGrid = useCallback((rowId: string, position: number) => {
    const row = layoutRows.find(r => r.id === rowId);
    if (!row) {
      console.error('Row not found for grid block addition:', rowId);
      return;
    }

    // Find the insertion point based on the grid position
    let insertionIndex: number;
    
    if (position === 0) {
      // Insert at the beginning of the row
      const firstBlockInRow = row.blocks[0];
      insertionIndex = firstBlockInRow ? blocks.findIndex(b => b.id === firstBlockInRow.id) : blocks.length;
    } else if (position < row.blocks.length) {
      // Insert between existing blocks
      const blockAtPosition = row.blocks[position];
      insertionIndex = blockAtPosition ? blocks.findIndex(b => b.id === blockAtPosition.id) : blocks.length;
    } else {
      // Insert at the end of the row
      const lastBlockInRow = row.blocks[row.blocks.length - 1];
      insertionIndex = lastBlockInRow ? 
        blocks.findIndex(b => b.id === lastBlockInRow.id) + 1 : 
        blocks.length;
    }

    console.log('Adding block to grid:', { rowId, position, insertionIndex });

    // Add the new block with layout metadata
    onAddBlock('paragraph', insertionIndex);
  }, [layoutRows, blocks, onAddBlock]);

  // Handle grid layout updates (column widths)
  const handleLayoutUpdate = useCallback((rowId: string, updates: { columnWidths: number[] }) => {
    const row = layoutRows.find(r => r.id === rowId);
    if (!row) return;

    // Update all blocks in the row with new column widths
    row.blocks.forEach(block => {
      onUpdateBlock(block.id, {
        meta: {
          ...block.meta,
          layout: {
            ...block.meta?.layout,
            columnWidths: updates.columnWidths
          }
        }
      });
    });
  }, [layoutRows, onUpdateBlock]);

  const handleDragStart = useCallback((e: React.DragEvent, blockId: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const sourceRow = layoutRows.find(row => row.blocks.some(b => b.id === blockId));
    
    console.log('Drag started:', { blockId, sourceRowId: sourceRow?.id });
    
    setDragState({
      draggedBlockId: blockId,
      draggedFromRowId: sourceRow?.id || null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: true
    });

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId.toString());
  }, [blocks, layoutRows]);

  const handleDragOver = useCallback((e: React.DragEvent, rowId: string, position?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    dragTimeoutRef.current = setTimeout(() => {
      setDragState(prev => ({
        ...prev,
        dragOverRowId: rowId,
        dragOverPosition: position ?? null
      }));
    }, 50);
  }, []);

  const handleDragLeave = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    dragTimeoutRef.current = setTimeout(() => {
      setDragState(prev => ({
        ...prev,
        dragOverRowId: null,
        dragOverPosition: null
      }));
    }, 100);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetPosition?: number) => {
    e.preventDefault();
    
    if (!dragState.draggedBlockId) return;

    const draggedBlock = blocks.find(b => b.id === dragState.draggedBlockId);
    const targetRow = layoutRows.find(r => r.id === targetRowId);
    
    if (!draggedBlock || !targetRow) {
      console.error('Invalid drop operation:', { draggedBlock: !!draggedBlock, targetRow: !!targetRow });
      setDragState({
        draggedBlockId: null,
        draggedFromRowId: null,
        dragOverRowId: null,
        dragOverPosition: null,
        isDragging: false
      });
      return;
    }

    const finalPosition = targetPosition ?? targetRow.blocks.length;
    
    console.log('Drop operation:', { 
      blockId: dragState.draggedBlockId, 
      targetRowId, 
      finalPosition,
      targetRowColumns: targetRow.columns 
    });

    onUpdateBlock(dragState.draggedBlockId, {
      meta: {
        ...draggedBlock.meta,
        layout: {
          row_id: targetRowId,
          position: finalPosition,
          columns: targetRow.columns,
          gap: targetRow.gap
        }
      }
    });

    setDragState({
      draggedBlockId: null,
      draggedFromRowId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: false
    });
  }, [dragState.draggedBlockId, blocks, layoutRows, onUpdateBlock]);

  const handleDragEnd = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    setDragState({
      draggedBlockId: null,
      draggedFromRowId: null,
      dragOverRowId: null,
      dragOverPosition: null,
      isDragging: false
    });
  }, []);

  const renderBlock = (block: ReviewBlock, rowIndex: number, blockIndex: number, row: LayoutRow) => {
    const globalIndex = blocks.findIndex(b => b.id === block.id);
    const isActive = activeBlockId === block.id;
    const isDragging = dragState.draggedBlockId === block.id;
    const isDropTarget = dragState.dragOverRowId === row.id && dragState.dragOverPosition === blockIndex;

    return (
      <div key={block.id} className="relative">
        {isDropTarget && (
          <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded z-20" />
        )}
        
        <div className="relative group">
          <div className="flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addBlockBetween(globalIndex)}
              className="h-6 w-24 text-xs"
              style={{ color: '#9ca3af' }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          <Card
            className={cn(
              "relative transition-all duration-200 cursor-pointer",
              isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md",
              !block.visible && "opacity-50",
              isDragging && "opacity-50 scale-95"
            )}
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: isActive ? '#3b82f6' : '#2a2a2a'
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
          >
            <div className={cn(
              "absolute -top-2 -right-2 flex items-center gap-1 z-10 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {row.columns === 1 && !block.meta?.layout?.row_id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Converting to 2 columns:', block.id);
                      convertToLayout(block.id, 2);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="2 colunas"
                  >
                    <Columns2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Converting to 3 columns:', block.id);
                      convertToLayout(block.id, 3);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="3 colunas"
                  >
                    <Columns3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Converting to 4 columns:', block.id);
                      convertToLayout(block.id, 4);
                    }}
                    className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                    title="4 colunas"
                  >
                    <Columns4 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockVisibilityToggle(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                title={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
              >
                {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-gray-800 border border-gray-600"
                title="Duplicar bloco"
              >
                <Copy className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                className="h-6 w-6 p-0 bg-red-800 border border-red-600 hover:bg-red-700"
                title="Remover bloco"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className={cn(
              "absolute -left-2 top-1/2 transform -translate-y-1/2 transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <DragHandle 
                onMoveUp={() => onMoveBlock(block.id, 'up')}
                onMoveDown={() => onMoveBlock(block.id, 'down')}
                canMoveUp={globalIndex > 0}
                canMoveDown={globalIndex < blocks.length - 1}
              />
            </div>

            <div className="p-4">
              <BlockRenderer
                block={block}
                onUpdate={onUpdateBlock}
                readonly={false}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderLayoutRow = (row: LayoutRow, rowIndex: number) => {
    if (row.columns === 1) {
      return (
        <div key={row.id} className="my-6">
          {renderBlock(row.blocks[0], rowIndex, 0, row)}
        </div>
      );
    }

    // Use ResizableGrid for multi-column layouts
    return (
      <ResizableGrid
        key={row.id}
        rowId={row.id}
        blocks={row.blocks}
        columns={row.columns}
        gap={row.gap}
        columnWidths={row.columnWidths}
        onUpdateLayout={handleLayoutUpdate}
        onAddBlock={addBlockToGrid}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        activeBlockId={activeBlockId}
        onActiveBlockChange={onActiveBlockChange}
        readonly={false}
        className="my-6"
      />
    );
  };

  return (
    <div className={cn("block-editor h-full", className)}>
      <div 
        className="h-full overflow-y-auto p-6"
        style={{ backgroundColor: '#121212' }}
      >
        {layoutRows.length > 0 ? (
          <div className="space-y-4">
            {layoutRows.map((row, index) => renderLayoutRow(row, index))}
          </div>
        ) : (
          <div 
            className="border-2 border-dashed rounded-lg p-12 text-center"
            style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
              Comece Criando seu Primeiro Bloco
            </h3>
            <p className="mb-6" style={{ color: '#d1d5db' }}>
              Use a paleta de blocos à esquerda para adicionar conteúdo à sua revisão
            </p>
          </div>
        )}

        {blocks.length > 0 && (
          <div className="flex justify-center pt-8">
            <Button
              variant="outline"
              onClick={() => addBlockBetween(blocks.length)}
              className="flex items-center gap-2"
              style={{ 
                borderColor: '#2a2a2a',
                backgroundColor: '#1a1a1a',
                color: '#ffffff'
              }}
            >
              <Plus className="w-4 h-4" />
              Adicionar Bloco
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
