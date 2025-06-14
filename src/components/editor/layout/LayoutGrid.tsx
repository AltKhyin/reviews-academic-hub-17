// ABOUTME: Component to render a generic layout grid (e.g. for sections).
// This is a placeholder for a more complex grid system if needed.
import React from 'react';
import { LayoutElement, ReviewBlock, BlockType, GridPosition, LayoutRowDefinition } from '@/types/review';
import { Grid2DContainer } from './Grid2DContainer'; 

export interface LayoutGridProps {
  layoutElement: LayoutElement & { type: 'grid', rows?: LayoutRowDefinition[] }; // Specify rows type for grid
  blocks: { [key: string]: ReviewBlock };
  onUpdateBlock: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlockToGrid: (type: BlockType, gridId: string, position: GridPosition) => void; 
  onActiveBlockChange: (blockId: string | null) => void;
  activeBlockId: string | null;
  readonly?: boolean;
}

export const LayoutGrid: React.FC<LayoutGridProps> = ({
  layoutElement,
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlockToGrid,
  onActiveBlockChange,
  activeBlockId,
  readonly,
}) => {
  if (layoutElement.settings?.type === '2d' || !layoutElement.settings?.type) { 
    return (
      <Grid2DContainer
        layoutElement={layoutElement} 
        blocks={blocks}
        onUpdateBlock={onUpdateBlock}
        onDeleteBlock={onDeleteBlock}
        onAddBlockToGrid={onAddBlockToGrid}
        onActiveBlockChange={onActiveBlockChange}
        activeBlockId={activeBlockId}
        readonly={readonly}
      />
    );
  }

  return (
    <div className="p-4 border border-dashed border-yellow-500 rounded-md my-2">
      <p className="text-yellow-400 text-sm">
        Layout Grid Type: {layoutElement.settings?.type || 'Default/2D'} (ID: {layoutElement.id}) - Rendering not fully implemented for this specific grid type.
      </p>
      <pre className="text-xs text-gray-500 mt-2">{JSON.stringify(layoutElement, null, 2)}</pre>
    </div>
  );
};
