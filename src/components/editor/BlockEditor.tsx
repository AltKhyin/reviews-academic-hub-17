// ABOUTME: Core orchestrator for the block-based editor experience.
// Manages block state, interactions, and renders the list of blocks.
import React, { useState, useCallback, useEffect } from 'react';
import { Review, ReviewBlock, BlockType, GridPosition, LayoutElement } from '@/types/review';
import { BlockList } from './BlockList';
import { EditorToolbar } from './EditorToolbar'; // Placeholder for toolbar
import { generateId } from '@/lib/utils'; 
import { DragDropContext, DropResult, ResponderProvided, Droppable } from '@hello-pangea/dnd'; // Using hello-pangea fork
import { useBlockManagement } from '@/hooks/useBlockManagement'; // Centralized logic
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
  const [review, setReview] = useState<Review>(
    initialReview || {
      id: generateId(),
      title: 'Nova Revisão',
      elements: [], // Initialize with an empty layout
      version: 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const {
    elements,
    blocks,
    updateBlock,
    addBlock,
    deleteBlock,
    moveBlockInList,
    setElements,
  } = useBlockManagement(review.elements, review.blocks || {}, (newElements, newBlocks) => {
    setReview(prev => ({ ...prev, elements: newElements, blocks: newBlocks }));
  });
  
  const { onDragEnd } = useBlockDragDrop(elements, blocks, moveBlockInList, setElements);


  useEffect(() => {
    if (initialReview) {
      setReview(initialReview);
      // Initialize elements and blocks from useBlockManagement based on new initialReview
    }
  }, [initialReview]);

  const handleSave = useCallback(() => {
    onSave(review);
  }, [review, onSave]);

  const handleSelectBlock = useCallback((blockId: string | null) => {
    setActiveBlockId(blockId);
  }, []);
  
  // Find a block by its ID from the centralized 'blocks' state
  const findBlockById = (blockId: string): ReviewBlock | undefined => {
    return blocks[blockId];
  };

  // If using dnd-kit or react-beautiful-dnd, this would be the onDragEnd handler
  const handleDragEnd = (result: DropResult, _provided: ResponderProvided) => {
    onDragEnd(result); // Delegate to the hook
  };

  return (
    <div className={`block-editor-container bg-gray-900 text-white min-h-screen flex flex-col ${className}`}>
      {!readonly && (
        <EditorToolbar
          onAddBlock={(type, layoutElementId) => {
             // For simplicity, adding to the first layout element if layoutElementId is not specified
             // Or, if layoutElementId is 'root', add directly to elements array
            if (layoutElementId === 'root' || !layoutElementId && elements.length === 0) {
                const newBlockId = addBlock(type, {content: {}}); // Assuming addBlock returns new block's ID or handles it
                if (newBlockId) {
                   const newLayoutElement: LayoutElement = { id: generateId(), type: 'block', blockId: newBlockId, settings: {}};
                   setElements(prev => [...prev, newLayoutElement]);
                }

            } else if (layoutElementId) {
                // Find the layout element (e.g., a grid) and add the block there.
                // This part needs to be implemented based on how blocks are added to grids.
                console.warn(`Adding block to layout element ${layoutElementId} not fully implemented.`);
                // Potentially call addBlockToGrid or similar from useBlockManagement here.
                // For now, let's assume addBlock can take a parentId or position.
                addBlock(type, { parentId: layoutElementId, content: {} });
            } else if (elements.length > 0 && elements[0].type === 'block'){
                // Fallback: add after the first block if no specific layout target.
                // This is a simplification. Ideally, user indicates where to add.
                addBlock(type, { afterBlockId: elements[0].blockId, content: {} });
            } else {
                // Fallback for empty or non-block first element
                const newBlockId = addBlock(type, {content: {}});
                 if (newBlockId) {
                   const newLayoutElement: LayoutElement = { id: generateId(), type: 'block', blockId: newBlockId, settings: {}};
                   setElements(prev => [...prev, newLayoutElement]);
                }
            }
          }}
          onSave={handleSave}
        />
      )}

      <div className="editor-content-area flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="main-editor-droppable" type="BLOCK_LIST">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <BlockList
                  layoutElements={elements}
                  blocks={blocks}
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock}
                  onMoveBlock={moveBlockInList}
                  onSelectBlock={handleSelectBlock}
                  activeBlockId={activeBlockId}
                  readonly={readonly}
                  // For grid/layout elements, onAddBlockToGrid might be needed
                  onAddBlockToGrid={(type, gridId, position) => {
                    console.log('Attempting to add block to grid:', type, gridId, position);
                    // This should ideally call a function like addBlockToGrid from useBlockManagement
                    // Example: addBlockToGrid(type, gridId, position, {});
                    // For now, using the general addBlock and assuming it can handle grid context or will be adapted
                    addBlock(type, { content: {}, parentId: gridId, position: position as any }); 
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
