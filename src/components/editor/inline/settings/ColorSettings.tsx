
// ABOUTME: Color settings panel for blocks
// Handles all color customization options

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineColorPicker } from '../InlineColorPicker';

interface ColorSettingsProps {
  block: ReviewBlock;
  onColorChange: (colorType: string, color: string) => void;
}

export const ColorSettings: React.FC<ColorSettingsProps> = ({
  block,
  onColorChange
}) => {
  return (
    <div className="space-y-2">
      <InlineColorPicker
        label="Texto"
        value={block.content.text_color || '#ffffff'}
        onChange={(color) => onColorChange('text_color', color)}
        readonly={false}
        compact={true}
      />
      <InlineColorPicker
        label="Fundo"
        value={block.content.background_color || 'transparent'}
        onChange={(color) => onColorChange('background_color', color)}
        readonly={false}
        compact={true}
      />
      <InlineColorPicker
        label="Borda"
        value={block.content.border_color || 'transparent'}
        onChange={(color) => onColorChange('border_color', color)}
        readonly={false}
        compact={true}
      />
      {(block.type === 'snapshot_card' || block.type === 'callout' || block.type === 'number_card') && (
        <InlineColorPicker
          label="Destaque"
          value={block.content.accent_color || '#3b82f6'}
          onChange={(color) => onColorChange('accent_color', color)}
          readonly={false}
          compact={true}
        />
      )}
    </div>
  );
};
