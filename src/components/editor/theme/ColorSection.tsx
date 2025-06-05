
// ABOUTME: Color customization section component
// Handles individual color property editing within theme sections

import React from 'react';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';

interface ColorItem {
  key: string;
  label: string;
  description?: string;
}

interface ColorSectionProps {
  colors: ColorItem[];
  sectionKey: string;
  getCurrentColorValue: (sectionKey: string, colorKey: string) => string;
  onColorChange: (sectionKey: string, colorKey: string, value: string) => void;
}

export const ColorSection: React.FC<ColorSectionProps> = ({
  colors,
  sectionKey,
  getCurrentColorValue,
  onColorChange
}) => {
  return (
    <div className="space-y-3">
      {colors.map((color) => (
        <div key={color.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label 
              className="text-xs font-medium"
              style={{ color: 'var(--editor-primary-text)' }}
            >
              {color.label}
            </Label>
            <div
              className="w-6 h-6 rounded border"
              style={{
                backgroundColor: getCurrentColorValue(sectionKey, color.key),
                borderColor: 'var(--editor-primary-border)'
              }}
            />
          </div>
          {color.description && (
            <p className="text-xs" style={{ color: 'var(--editor-muted-text)' }}>
              {color.description}
            </p>
          )}
          <ColorPicker
            value={getCurrentColorValue(sectionKey, color.key)}
            onChange={(value) => onColorChange(sectionKey, color.key, value)}
          />
        </div>
      ))}
    </div>
  );
};
