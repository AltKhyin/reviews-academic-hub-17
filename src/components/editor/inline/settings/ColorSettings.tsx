
// ABOUTME: Color settings panel for blocks with consistent color system
// Handles all color customization options using validated colors

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineColorPicker } from '../InlineColorPicker';
import { CSS_VARIABLES, APP_COLORS } from '@/utils/colorSystem';

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
        value={block.content.text_color || APP_COLORS.TEXT_PRIMARY}
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
          value={block.content.accent_color || APP_COLORS.INFO}
          onChange={(color) => onColorChange('accent_color', color)}
          readonly={false}
          compact={true}
        />
      )}
    </div>
  );
};
