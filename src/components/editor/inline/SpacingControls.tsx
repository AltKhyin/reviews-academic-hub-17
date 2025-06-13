
// ABOUTME: Spacing controls for block layout with proper type handling
// Provides margin and padding adjustment controls

import React from 'react';
import { ReviewBlock, SpacingConfig } from '@/types/review';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface SpacingControlsProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
  block,
  onUpdate
}) => {
  const spacing = block.meta?.spacing || {};
  const margin = spacing.margin || { top: 0, bottom: 0, left: 0, right: 0 };
  const padding = spacing.padding || { top: 0, bottom: 0, left: 0, right: 0 };

  const handleSpacingChange = (
    type: 'margin' | 'padding',
    side: 'top' | 'bottom' | 'left' | 'right',
    value: number
  ) => {
    const newSpacing: SpacingConfig = {
      ...spacing,
      [type]: {
        ...spacing[type],
        [side]: value
      }
    };

    onUpdate({
      meta: {
        ...block.meta,
        spacing: newSpacing
      }
    });
  };

  const SpacingInput = ({ 
    label, 
    type, 
    side, 
    value 
  }: { 
    label: string; 
    type: 'margin' | 'padding'; 
    side: 'top' | 'bottom' | 'left' | 'right'; 
    value: number;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs text-gray-400">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => handleSpacingChange(type, side, parseInt(e.target.value) || 0)}
        className="h-8 text-xs"
        min="0"
        max="100"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Margin Controls */}
      <div>
        <Label className="text-sm font-medium mb-2 block text-gray-300">Margin</Label>
        <div className="grid grid-cols-2 gap-2">
          <SpacingInput label="Top" type="margin" side="top" value={margin.top || 0} />
          <SpacingInput label="Bottom" type="margin" side="bottom" value={margin.bottom || 0} />
          <SpacingInput label="Left" type="margin" side="left" value={margin.left || 0} />
          <SpacingInput label="Right" type="margin" side="right" value={margin.right || 0} />
        </div>
      </div>

      <Separator />

      {/* Padding Controls */}
      <div>
        <Label className="text-sm font-medium mb-2 block text-gray-300">Padding</Label>
        <div className="grid grid-cols-2 gap-2">
          <SpacingInput label="Top" type="padding" side="top" value={padding.top || 0} />
          <SpacingInput label="Bottom" type="padding" side="bottom" value={padding.bottom || 0} />
          <SpacingInput label="Left" type="padding" side="left" value={padding.left || 0} />
          <SpacingInput label="Right" type="padding" side="right" value={padding.right || 0} />
        </div>
      </div>
    </div>
  );
};
