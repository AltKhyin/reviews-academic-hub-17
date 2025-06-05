
// ABOUTME: Inline color picker with preset colors and custom hex input
// Provides contextual color selection for blocks and text elements

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Pipette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorOption {
  name: string;
  value: string;
}

interface InlineColorPickerProps {
  colors: ColorOption[];
  onChange: (colorType: string, value: string) => void;
  readonly?: boolean;
  compact?: boolean;
  className?: string;
}

const DEFAULT_PRESET_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

export const InlineColorPicker: React.FC<InlineColorPickerProps> = ({
  colors,
  onChange,
  readonly = false,
  compact = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (colorName: string, colorValue: string) => {
    onChange(colorName, colorValue);
    setIsOpen(false);
  };

  const getCurrentColorDisplay = (color: ColorOption) => {
    if (color.value === 'transparent') return 'transparent';
    return color.value || '#ffffff';
  };

  if (readonly) {
    return (
      <div className={cn("space-y-2", className)}>
        {colors.map((color) => (
          <div key={color.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-600 flex-shrink-0"
              style={{ 
                backgroundColor: getCurrentColorDisplay(color),
                backgroundImage: color.value === 'transparent' 
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : undefined,
                backgroundSize: color.value === 'transparent' ? '6px 6px' : undefined,
                backgroundPosition: color.value === 'transparent' ? '0 0, 0 3px, 3px -3px, -3px 0px' : undefined
              }}
            />
            <span className="text-xs text-gray-300">{color.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {colors.map((color) => (
        <div key={color.name} className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-300 min-w-0 flex-shrink-0 w-16">
            {color.name}:
          </label>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-20 p-1 flex items-center gap-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
              >
                <div
                  className="w-4 h-4 rounded border border-gray-600 flex-shrink-0"
                  style={{ 
                    backgroundColor: getCurrentColorDisplay(color),
                    backgroundImage: color.value === 'transparent' 
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                      : undefined,
                    backgroundSize: color.value === 'transparent' ? '8px 8px' : undefined,
                    backgroundPosition: color.value === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
                  }}
                />
                <Palette className="w-3 h-3 text-gray-400" />
              </Button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-64 p-3"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div className="space-y-3">
                {/* Preset Colors */}
                <div>
                  <div className="text-xs font-medium mb-2 text-gray-300">
                    Cores Predefinidas
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    <button
                      onClick={() => handleColorChange(color.name, 'transparent')}
                      className="w-8 h-8 rounded border border-gray-600 hover:border-gray-400 transition-colors"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '6px 6px',
                        backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                      }}
                      title="Transparente"
                    />
                    {DEFAULT_PRESET_COLORS.map((presetColor) => (
                      <button
                        key={presetColor}
                        onClick={() => handleColorChange(color.name, presetColor)}
                        className={cn(
                          "w-8 h-8 rounded border border-gray-600 hover:border-gray-400 transition-colors",
                          color.value === presetColor && "ring-2 ring-blue-500"
                        )}
                        style={{ backgroundColor: presetColor }}
                        title={presetColor}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div>
                  <div className="text-xs font-medium mb-2 text-gray-300">
                    Cor Personalizada
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={color.value}
                      onChange={(e) => handleColorChange(color.name, e.target.value)}
                      placeholder="#ffffff"
                      className="text-xs h-8"
                      style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                    />
                    <input
                      type="color"
                      value={color.value === 'transparent' ? '#ffffff' : color.value}
                      onChange={(e) => handleColorChange(color.name, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
};
