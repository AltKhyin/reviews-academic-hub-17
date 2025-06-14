
// ABOUTME: Renders a list of top-level layout elements for the block editor.
// It acts as the main canvas, dispatching rendering to SingleBlock, LayoutRow, etc.
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition, AddBlockOptions } from '@/types/review';
import { SingleBlock } from './blocks/SingleBlock';
import { LayoutRow } from './layout/LayoutRow';
import { LayoutGrid } from './layout/LayoutGrid';
import { Button } from '@/components/ui/button';
import { Draggable, Droppable, DroppableProvided } from '@hello-pangea/dnd';

export interface BlockListProps {
  layoutElements: LayoutElement[];
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveElement: (layoutElementId: string, direction: 'up' | 'down') => void;
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock: (options: Partial<AddBlockOptions> & { type: BlockType }) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void;
  activeBlockId: string | null;
  readonly?: boolean;
}

export const BlockList: React.FC<BlockListProps> = ({
  layoutElements,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onMoveElement,
  onSelectBlock,
  onAddBlock,
  onAddBlockToGrid,
  activeBlockId,
  readonly,
}) => {
  if (!layoutElements || layoutElements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
        <p>Ainda não há conteúdo.</p>
        <Button
          onClick={() => onAddBlock({ type: 'text', insertAtIndex: 0 })}
          variant="outline"
          className="mt-4"
        >
          Adicionar um bloco de texto
        </Button>
      </div>
    );
  }

  return (
    <Droppable droppableId="main-editor-droppable" type="LAYOUT_ELEMENT" isDropDisabled={readonly}>
      {(provided: DroppableProvided) => (
        <div 
            className="block-list-renderer space-y-1"
            ref={provided.innerRef}
            {...provided.droppableProps}
        >
          {layoutElements.map((element, index) => {
            const renderComponent = () => {
              switch (element.type) {
                case 'block_container':
                  if (!element.blockId || !blocks[element.blockId]) {
                    return <div key={element.id} className="text-red-500 p-2 bg-red-900/20 rounded">Erro: Bloco não encontrado para o container. ID do bloco: {element.blockId}</div>;
                  }
                  return (
                    <SingleBlock
                      key={element.id}
                      layoutElement={element as LayoutElement & { type: 'block_container', blockId: string }}
                      block={blocks[element.blockId]}
                      index={index}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onMoveElement={onMoveElement}
                      onSelectBlock={onSelectBlock}
                      activeBlockId={activeBlockId}
                      readonly={readonly}
                      onAddBlock={onAddBlock}
                    />
                  );
                case 'row':
                   return (
                     <LayoutRow
                       key={element.id}
                       layoutElement={element as LayoutElement & { type: 'row' }}
                       blocks={blocks}
                       index={index}
                       onUpdateBlock={onUpdateBlock}
                       onDeleteBlock={onDeleteBlock}
                       onMoveElement={onMoveElement}
                       onSelectBlock={onSelectBlock}
                       onAddBlock={onAddBlock}
                       onAddBlockToGrid={onAddBlockToGrid}
                       activeBlockId={activeBlockId}
                       readonly={readonly}
                     />
                   );
                case 'grid':
                  return (
                    <LayoutGrid
                      key={element.id}
                      layoutElement={element as LayoutElement & { type: 'grid' }}
                      blocks={blocks}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onAddBlockToGrid={onAddBlockToGrid}
                      onActiveBlockChange={onSelectBlock}
                      activeBlockId={activeBlockId}
                      readonly={readonly}
                    />
                  );
                default:
                  const unknownElement = element as any;
                  return <div key={unknownElement.id || index} className="text-xs text-red-500 p-1 bg-red-900/20 rounded">Unsupported layout element type: {unknownElement.type}</div>;
              }
            };

            // Wrap each top-level element in a Draggable
            return (
              <Draggable key={element.id} draggableId={element.id} index={index} isDragDisabled={readonly}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    {renderComponent()}
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
