
// ABOUTME: Enhanced block editor with comprehensive grid layout support and string ID compatibility
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useEditorLayout } from '@/hooks/useEditorLayout';
import { useBlockOperations } from '@/hooks/useBlockOperations';
import { useGridState } from '@/hooks/grid/useGridState';
import { BlockList } from './BlockList';
import { BlockControls } from './BlockControls';
import { EditorToolbar } from './EditorToolbar';
import { Grid2DContainer } from './layout/Grid2DContainer';
import { ReviewBlock } from '@/types/review';
import { Grid2DLayout } from '@/types/grid';

interface BlockEditorProps {
  issueId: string;
  blocks: ReviewBlock[];
  onBlocksChange: (blocks: ReviewBlock[]) => void;
  onSave: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  gridLayout?: Grid2DLayout;
  onGridLayoutChange?: (layout: Grid2DLayout) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  issueId,
  blocks,
  onBlocksChange,
  onSave,
  isEditing,
  onToggleEdit,
  gridLayout,
  onGridLayoutChange
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'list' | 'grid'>('list');

  // Use grid state hook
  const gridStateResult = useGridState(gridLayout);

  // Get the active block
  const activeBlock = useMemo(() => {
    return blocks.find(block => block.id === activeBlockId);
  }, [blocks, activeBlockId]);

  const {
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock
  } = useBlockOperations({
    blocks,
    onBlocksChange,
    activeBlockId,
    onActiveBlockChange: setActiveBlockId
  });

  const {
    layoutMode,
    toggleLayoutMode,
    isGridMode
  } = useEditorLayout();

  // Update grid layout when it changes
  useEffect(() => {
    if (onGridLayoutChange && gridStateResult.grid) {
      onGridLayoutChange(gridStateResult.grid);
    }
  }, [gridStateResult.grid, onGridLayoutChange]);

  const handleTogglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleActiveBlockChange = useCallback((blockId: string | null) => {
    setActiveBlockId(blockId || '');
  }, []);

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<ReviewBlock>) => {
    updateBlock(blockId, updates);
  }, [updateBlock]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    deleteBlock(blockId);
    if (activeBlockId === blockId) {
      setActiveBlockId('');
    }
  }, [deleteBlock, activeBlockId]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    duplicateBlock(blockId);
  }, [duplicateBlock]);

  const handleMoveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    moveBlock(blockId, direction);
  }, [moveBlock]);

  const handleLayoutToggle = useCallback(() => {
    setCurrentLayout(prev => prev === 'list' ? 'grid' : 'list');
    toggleLayoutMode();
  }, [toggleLayoutMode]);

  // Handle grid operations
  const handleGridAddRow = useCallback(() => {
    if (gridStateResult.grid) {
      gridStateResult.addRow(gridStateResult.grid.id);
    }
  }, [gridStateResult]);

  const handleGridRemoveRow = useCallback((rowIndex: number) => {
    if (gridStateResult.grid) {
      gridStateResult.removeRow(gridStateResult.grid.id, rowIndex);
    }
  }, [gridStateResult]);

  const handleGridUpdateColumns = useCallback((columns: number) => {
    if (gridStateResult.grid) {
      gridStateResult.updateColumns(gridStateResult.grid.id, columns);
    }
  }, [gridStateResult]);

  return (
    <div className="block-editor h-full flex flex-col">
      {/* Toolbar */}
      <EditorToolbar
        onTogglePreview={handleTogglePreview}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleSidebar={handleToggleSidebar}
        showPreview={showPreview}
        isFullscreen={isFullscreen}
        sidebarCollapsed={sidebarCollapsed}
        onLayoutToggle={handleLayoutToggle}
        currentLayout={currentLayout}
      />

      {/* Main editing area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block list or grid container */}
        <div className="flex-1 overflow-auto">
          {currentLayout === 'grid' && gridStateResult.grid ? (
            <Grid2DContainer
              blocks={blocks}
              activeBlockId={activeBlockId}
              onActiveBlockChange={handleActiveBlockChange}
              onUpdateBlock={handleUpdateBlock}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveBlock={handleMoveBlock}
              onAddRow={handleGridAddRow}
              onRemoveRow={handleGridRemoveRow}
              onUpdateColumns={handleGridUpdateColumns}
              gridState={gridStateResult}
              onDrop={() => {}}
            />
          ) : (
            <BlockList
              blocks={blocks}
              activeBlockId={activeBlockId}
              onActiveBlockChange={handleActiveBlockChange}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveBlock={handleMoveBlock}
              onAddBlock={addBlock}
            />
          )}
        </div>

        {/* Block controls sidebar */}
        {!sidebarCollapsed && activeBlock && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <BlockControls
              block={activeBlock}
              onUpdateBlock={(updates) => handleUpdateBlock(activeBlock.id, updates)}
              onDeleteBlock={() => handleDeleteBlock(activeBlock.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
