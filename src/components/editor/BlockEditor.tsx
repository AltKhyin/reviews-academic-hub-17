
// ABOUTME: Core orchestrator for the block-based editor experience.
// Manages block state, interactions, and renders the list of blocks.
import React, { useState, useCallback, useEffect } from 'react';
import { Review, ReviewBlock, BlockType, GridPosition, LayoutElement, AddBlockOptions } from '@/types/review';
import { BlockList } from './BlockList';
import { EditorToolbar, EditorToolbarProps } from './EditorToolbar';
import { generateId } from '@/lib/utils';
import { DragDropContext, DropResult, ResponderProvided, Droppable } from '@hello-pangea/dnd';
import { useBlockManagement, UseBlockManagementReturn } from '@/hooks/useBlockManagement';
import { useBlockDragDrop } from '@/hooks/useBlockDragDrop';

export interface BlockEditorProps {
  initialReview?: Review;
  onSave: (review: Review) => void;
  readonly?: boolean;
  className?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialReview,
  onSave,
  readonly = false,
  className,
}) => {
  const blockManager: UseBlockManagementReturn = useBlockManagement(
    initialReview?.elements,
    initialReview?.blocks,
  );

  const {
    elements,
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    moveElement,
    setElements,
  } = blockManager;

  const { onDragEnd } = useBlockDragDrop({ elements, setElements });

  const handleSave = useCallback(() => {
    const reviewToSave: Review = {
      id: initialReview?.id || generateId(),
      title: initialReview?.title || 'Nova Revisão', // Title is not editable here, comes from parent
      elements: elements,
      blocks: blocks,
      version: initialReview?.version ? initialReview.version + 1 : 1,
      status: initialReview?.status || 'draft',
      createdAt: initialReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(reviewToSave);
  }, [initialReview, elements, blocks, onSave]);

  const handleSelectBlock = useCallback((blockId: string | null) => {
    setActiveBlockId(blockId);
  }, [setActiveBlockId]);

  const handleDndDragEnd = (result: DropResult, _provided: ResponderProvided) => {
    onDragEnd(result);
  };

  const handleAddBlock = useCallback((options: Partial<AddBlockOptions> & { type: BlockType }) => {
    const newBlockId = addBlock(options);
    if (newBlockId) {
      setActiveBlockId(newBlockId);
    }
  }, [addBlock, setActiveBlockId]);

  const toolbarProps: EditorToolbarProps = {
    onAddBlock: (type: BlockType) => {
      handleAddBlock({ type, insertAtIndex: elements.length });
    },
    onSave: handleSave,
    canUndo: blockManager.canUndo,
    canRedo: blockManager.canRedo,
    onUndo: blockManager.undo,
    onRedo: blockManager.redo,
  };

  return (
    <div className={`block-editor-container bg-gray-900 text-white min-h-screen flex flex-col ${className}`}>
      {!readonly && <EditorToolbar {...toolbarProps} />}

      <div className="editor-content-area flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <DragDropContext onDragEnd={handleDndDragEnd}>
          <Droppable droppableId="main-editor-droppable" type="LAYOUT_ELEMENT">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <BlockList
                  layoutElements={elements}
                  blocks={blocks}
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock}
                  onMoveElement={moveElement}
                  onSelectBlock={handleSelectBlock}
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                  onAddBlockToGrid={(type, gridId, position) => {
                    handleAddBlock({ type, parentElementId: gridId, targetPosition: position });
                  }}
                  onAddBlock={handleAddBlock}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
