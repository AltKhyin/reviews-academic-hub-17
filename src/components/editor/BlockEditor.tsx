// ABOUTME: Core orchestrator for the block-based editor experience.
// Manages block state, interactions, and renders the list of blocks.
import React, { useState, useCallback, useEffect } from 'react';
import { Review, ReviewBlock, BlockType, GridPosition, LayoutElement } from '@/types/review';
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
  // Initial state setup for the review, including elements and blocks
  const [currentReviewId, setCurrentReviewId] = useState(initialReview?.id || generateId());
  const [currentReviewTitle, setCurrentReviewTitle] = useState(initialReview?.title || 'Nova Revisão');
  // Other review metadata can be managed here if needed

  const blockManager: UseBlockManagementReturn = useBlockManagement(
    initialReview?.elements || [],
    initialReview?.blocks || {},
    (newElements, newBlocks) => {
      // This callback can be used to sync with a higher-level state or trigger saves
      // For now, the hook manages its internal state which we access directly.
      // If we need to reconstruct the `Review` object for saving, we'll do it in handleSave.
    }
  );

  const { 
    elements, 
    blocks, 
    activeBlockId, 
    setActiveBlockId, 
    addBlock, 
    updateBlock, 
    deleteBlock, 
    moveElement, // Renamed from moveBlockInList for clarity (operates on elements)
    setElements // For DND
  } = blockManager;
  
  const { onDragEnd } = useBlockDragDrop({ elements, setElements });

  useEffect(() => {
    if (initialReview) {
      setCurrentReviewId(initialReview.id || generateId());
      setCurrentReviewTitle(initialReview.title || 'Nova Revisão');
      // Reset blockManager's internal state if initialReview changes significantly
      // This might require a reset function in useBlockManagement or re-instantiating the hook
      // For simplicity, assuming useBlockManagement initializes correctly with new initial values.
      // If useBlockManagement doesn't internally reset with new initial props, we might need to use a key on BlockEditor or manage reset more explicitly.
      setElements(initialReview.elements || []);
      blockManager.setBlocks(initialReview.blocks || {}); // Expose setBlocks from hook
    }
  }, [initialReview, setElements, blockManager]);

  const handleSave = useCallback(() => {
    const reviewToSave: Review = {
      id: currentReviewId,
      title: currentReviewTitle,
      elements: elements, // Current elements from blockManager
      blocks: blocks,     // Current blocks from blockManager
      version: initialReview?.version ? initialReview.version + 1 : 1,
      status: 'draft', // Or derive from actual status
      createdAt: initialReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(reviewToSave);
  }, [currentReviewId, currentReviewTitle, elements, blocks, initialReview, onSave]);

  const handleSelectBlock = useCallback((blockId: string | null) => {
    setActiveBlockId(blockId);
  }, [setActiveBlockId]);
  
  const handleDragEnd = (result: DropResult, _provided: ResponderProvided) => {
    onDragEnd(result); 
  };

  const toolbarProps: EditorToolbarProps = {
    onAddBlock: (type: BlockType, layoutElementId?: string) => {
      let newBlockId: string | null = null;
      if (layoutElementId === 'root' || !layoutElementId && elements.length === 0) {
        newBlockId = addBlock({ type, insertAtIndex: elements.length });
      } else if (layoutElementId) {
        console.warn(`Adding block to layout element ${layoutElementId} requires specific parent handling.`);
        newBlockId = addBlock({ type, parentElementId: layoutElementId });
      } else if (elements.length > 0) {
         // Add to the end of the top-level elements by default
        newBlockId = addBlock({ type, insertAtIndex: elements.length });
      } else {
        newBlockId = addBlock({ type, insertAtIndex: 0 });
      }
      if (newBlockId) setActiveBlockId(newBlockId);
    },
    onSave: handleSave,
    // Add other props like canUndo, canRedo, onUndo, onRedo if toolbar handles them
    canUndo: blockManager.canUndo,
    canRedo: blockManager.canRedo,
    onUndo: blockManager.undo,
    onRedo: blockManager.redo,
  };

  return (
    <div className={`block-editor-container bg-gray-900 text-white min-h-screen flex flex-col ${className}`}>
      {!readonly && <EditorToolbar {...toolbarProps} />}

      <div className="editor-content-area flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="main-editor-droppable" type="ELEMENT_LIST"> {/* Changed type */}
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <BlockList
                  layoutElements={elements} // Pass LayoutElement[]
                  blocks={blocks} // Pass { [id: string]: ReviewBlock }
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock} // This should delete the block and its containing LayoutElement if it's a 'block_container'
                  onMoveBlock={(blockId, dir) => {
                      // Find the LayoutElement containing this blockId if it's a 'block_container'
                      // And then move that LayoutElement.
                      // This is simplified; a direct block move might be complex with layouts.
                      const elementToMove = elements.find(el => el.type === 'block_container' && el.blockId === blockId);
                      if (elementToMove) {
                        moveElement(elementToMove.id, dir);
                      }
                  }}
                  onSelectBlock={handleSelectBlock}
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                  onAddBlockToGrid={(type, gridId, position) => {
                    const newBlockId = addBlock({ type, parentElementId: gridId, targetPosition: position });
                    if (newBlockId) setActiveBlockId(newBlockId);
                  }}
                  // onAddBlock might be needed for BlockList to add blocks relative to others
                  onAddBlock={(type, index, parentLayoutId, columnIndex) => {
                      // This is getting complex. AddBlock in toolbar is simpler.
                      // For adding within layouts, specific handlers in LayoutRow/Grid might be better.
                      console.log("Request to add block from BlockList:", {type, index, parentLayoutId, columnIndex});
                      // Example: addBlock({type, parentElementId: parentLayoutId, targetPosition: index})
                      // For now, prefer adding via toolbar or context menus on layout elements.
                  }}
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
