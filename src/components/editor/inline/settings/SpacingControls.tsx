
// ABOUTME: Component for controlling spacing (padding, margin) of a block.
import React from 'react';
import { ReviewBlock, SpacingConfig } from '@/types/review';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SpacingControlsProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({ block, onUpdate }) => {
  const spacing = block.meta?.spacing || {};

  const handleSpacingChange = (property: keyof SpacingConfig, value: string) => {
    const newSpacing = {
      ...spacing,
      [property]: value,
    };
    onUpdate({ meta: { ...block.meta, spacing: newSpacing } });
  };

  const spacingFields: (keyof SpacingConfig)[] = [
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {spacingFields.map(field => (
          <div key={field} className="space-y-1">
            <Label htmlFor={`spacing-${field}`} className="text-xs capitalize text-gray-300">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Input
              id={`spacing-${field}`}
              value={spacing[field] || ''}
              onChange={e => handleSpacingChange(field, e.target.value)}
              placeholder="e.g., 8px"
              className="bg-gray-800 border-gray-700 h-8 text-white"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Use any valid CSS unit (px, rem, %, etc.).
      </p>
    </div>
  );
};
