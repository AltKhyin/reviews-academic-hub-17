
// ABOUTME: Handles drag and drop logic for blocks using @hello-pangea/dnd.
// Manages reordering of blocks within a list or potentially between layout areas.

import { useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { LayoutElement, ReviewBlock } from '@/types/review'; // ReviewBlock might not be directly manipulated here if elements are LayoutElements

// Assuming setElements updates the main array of LayoutElements
// Assuming moveBlockInList (or similar) can reorder these LayoutElements

interface UseBlockDragDropProps {
  elements: LayoutElement[];
  // blocks: { [key: string]: ReviewBlock }; // May not be needed directly if DND only reorders elements
  // moveBlockInList: (draggableId: string, destinationIndex: number, sourceIndex: number) => void; // More generic
  setElements: (elements: LayoutElement[]) => void; // For reordering elements
}

export const useBlockDragDrop = ({
  elements,
  setElements,
}: UseBlockDragDropProps) => {
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return; // Dropped outside a droppable area
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return; // Dropped in the same place
    }

    // Assuming draggableId is the ID of the LayoutElement
    const newElements = Array.from(elements);
    const [movedElement] = newElements.splice(source.index, 1);
    newElements.splice(destination.index, 0, movedElement);

    setElements(newElements);

    // If blocks need specific metadata updates based on new layout position,
    // that logic would go here or be triggered by the state change.
    // For example, if a block moves into a grid, its meta.layout might need updating.
    // This basic implementation just reorders the elements array.

  }, [elements, setElements]);

  return { onDragEnd };
};
