
// ABOUTME: Enhanced block editor with improved spacing and visual feedback
// Provides comprehensive block management with proper margins and drag indicators

import React, { useCallback, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewBlock, BlockType } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { DragHandle } from './DragHandle';
import { ResizableGrid } from './layout/ResizableGrid';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop';
import { useGridLayoutManager } from '@/hooks/useGridLayoutManager';
import { Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  blocks: ReviewBlock[];
  activeBlockId?: number | null;
  onActiveBlockChange?: (blockId: number | null) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: number) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onAddBlock: (type: BlockType, position?: number) => void;
  onDuplicateBlock: (blockId: number) => void;
  onConvertToGrid: (blockIds: number[], columns: number) => void;
  onMergeBlockIntoGrid: (blockId: number, targetRowId: string, position?: number) => void;
  className?: string;
}

interface LayoutGroup {
  type: 'single' | 'grid';
  blocks: ReviewBlock[];
  rowId?: string;
  gridConfig?: {
    columns: number;
    gap: number;
    columnWidths?: number[];
  };
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
  onMergeBlockIntoGrid,
  className
}) => {
  const [hoveredBlockId, setHoveredBlockId] = useState<number | null>(null);

  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useBlockDragDrop({
    blocks,
    onMoveBlock,
    onMergeBlockIntoGrid
  });

  const { updateGridLayout } = useGridLayoutManager({
    blocks,
    onUpdateBlock
  });

  // Group blocks by layout rows for proper grid rendering
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    const groups: LayoutGroup[] = [];
    const processedBlockIds = new Set<number>();
    
    // Sort blocks by sort_index to maintain order
    const sortedBlocks = [...blocks].sort((a, b) => a.sort_index - b.sort_index);

    sortedBlocks.forEach((block) => {
      if (processedBlockIds.has(block.id)) return;

      const layout = block.meta?.layout;
      
      if (layout?.row_id && typeof layout.row_id === 'string') {
        // This block is part of a grid row
        const rowBlocks = sortedBlocks.filter(b => 
          b.meta?.layout?.row_id === layout.row_id && 
          !processedBlockIds.has(b.id)
        );
        
        // Mark all blocks in this row as processed
        rowBlocks.forEach(b => processedBlockIds.add(b.id));
        
        // Extract grid configuration from the first block's layout
        const gridConfig = {
          columns: layout.columns || rowBlocks.length,
          gap: layout.gap || 4,
          columnWidths: layout.columnWidths
        };
        
        groups.push({
          type: 'grid',
          blocks: rowBlocks,
          rowId: layout.row_id,
          gridConfig
        });
      } else {
        // Single block
        processedBlockIds.add(block.id);
        groups.push({
          type: 'single',
          blocks: [block]
        });
      }
    });

    return groups;
  }, [blocks]);

  const handleBlockClick = useCallback((blockId: number) => {
    onActiveBlockChange?.(blockId);
  }, [onActiveBlockChange]);

  const handleAddBlockAfter = useCallback((afterBlockId: number) => {
    const blockIndex = blocks.findIndex(b => b.id === afterBlockId);
    if (blockIndex !== -1) {
      onAddBlock('paragraph', blockIndex + 1);
    }
  }, [blocks, onAddBlock]);

  if (blocks.length === 0) {
    return (
      <div className={cn("block-editor p-6", className)} style={{ backgroundColor: '#121212' }}>
        <Card 
          className="border-dashed border-2 p-12 text-center hover:bg-gray-800/50 transition-colors cursor-pointer"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            color: '#ffffff'
          }}
          onClick={() => onAddBlock('paragraph', 0)}
        >
          <div className="flex flex-col items-center gap-4">
            <Plus className="w-12 h-12" style={{ color: '#6b7280' }} />
            <div>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
                Começar a Escrever
              </h3>
              <p style={{ color: '#d1d5db' }}>
                Clique aqui para adicionar seu primeiro bloco ou use a paleta lateral.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("block-editor py-4", className)} style={{ backgroundColor: '#121212' }}>
      <div className="space-y-4">
        {layoutGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="layout-group mx-4">
            {group.type === 'grid' && group.rowId && group.gridConfig ? (
              <ResizableGrid
                rowId={group.rowId}
                blocks={group.blocks}
                columns={group.gridConfig.columns}
                gap={group.gridConfig.gap}
                columnWidths={group.gridConfig.columnWidths}
                onUpdateLayout={updateGridLayout}
                onAddBlock={(rowId, position) => onAddBlock('paragraph', position)}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                activeBlockId={activeBlockId}
                onActiveBlockChange={onActiveBlockChange}
                dragState={dragState}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="my-6"
              />
            ) : (
              group.blocks.map((block) => {
                const isActive = activeBlockId === block.id;
                const isHovered = hoveredBlockId === block.id;
                const isDragTarget = dragState.dragOverBlockId === block.id;
                const isDragging = dragState.draggedBlockId === block.id;
                
                return (
                  <div 
                    key={block.id}
                    className={cn(
                      "block-item relative group transition-all duration-200 mx-2",
                      isActive && "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900",
                      isDragTarget && "border-t-4 border-blue-500",
                      isDragging && "opacity-50"
                    )}
                    onMouseEnter={() => setHoveredBlockId(block.id)}
                    onMouseLeave={() => setHoveredBlockId(null)}
                    style={{
                      margin: '8px 16px', // Proper spacing from edges
                    }}
                  >
                    <Card
                      className={cn(
                        "block-card relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                        isActive && "ring-2 ring-blue-500"
                      )}
                      style={{ 
                        backgroundColor: isActive ? '#1e40af' : '#1a1a1a',
                        borderColor: isActive ? '#3b82f6' : '#2a2a2a',
                        color: '#ffffff'
                      }}
                      onClick={() => handleBlockClick(block.id)}
                      onDragOver={(e) => handleDragOver(e, block.id, 'single')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, block.id, undefined, 'single')}
                    >
                      {/* Drag Handle */}
                      {(isHovered || isActive) && (
                        <div 
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 opacity-70 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => handleDragStart(e, block.id, 'single')}
                          onDragEnd={handleDragEnd}
                          style={{
                            marginLeft: '-8px', // Ensure drag handle doesn't overflow
                          }}
                        >
                          <GripVertical className="w-4 h-4" style={{ color: '#9ca3af' }} />
                        </div>
                      )}
                      
                      {/* Block Content */}
                      <div className="block-content p-4 pl-8">
                        <BlockRenderer
                          block={block}
                          readonly={false}
                          isActive={isActive}
                          onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                          onDelete={() => onDeleteBlock(block.id)}
                          onDuplicate={() => onDuplicateBlock(block.id)}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Add Block Button */}
                      {(isHovered || isActive) && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddBlockAfter(block.id);
                            }}
                            className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                            style={{ 
                              backgroundColor: '#3b82f6',
                              borderColor: '#3b82f6',
                              color: '#ffffff'
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })
            )}
          </div>
        ))}
        
        {/* Final Add Block Button */}
        <div className="mx-6 mt-8">
          <Button
            variant="outline"
            onClick={() => onAddBlock('paragraph', blocks.length)}
            className="w-full h-12 border-dashed hover:bg-gray-800/50 transition-colors"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: '#2a2a2a',
              color: '#d1d5db'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco
          </Button>
        </div>
      </div>
    </div>
  );
};
