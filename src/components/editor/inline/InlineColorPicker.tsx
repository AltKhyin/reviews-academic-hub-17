
// ABOUTME: Inline color picker with preset colors and custom hex input
// Provides contextual color selection for blocks and text elements

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Pipette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presetColors?: string[];
  allowTransparent?: boolean;
  className?: string;
}

const DEFAULT_PRESET_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

export const InlineColorPicker: React.FC<InlineColorPickerProps> = ({
  value,
  onChange,
  label = "Cor",
  presetColors = DEFAULT_PRESET_COLORS,
  allowTransparent = true,
  className
}) => {
  const [customColor, setCustomColor] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (color.match(/^#[0-9A-F]{6}$/i) || color === 'transparent') {
      onChange(color);
    }
  };

  const getCurrentColorDisplay = () => {
    if (value === 'transparent') return 'transparent';
    return value || '#ffffff';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="text-xs font-medium text-gray-300 min-w-0 flex-shrink-0">
        {label}:
      </label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                backgroundColor: getCurrentColorDisplay(),
                backgroundImage: value === 'transparent' 
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : undefined,
                backgroundSize: value === 'transparent' ? '8px 8px' : undefined,
                backgroundPosition: value === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
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
                {allowTransparent && (
                  <button
                    onClick={() => handlePresetClick('transparent')}
                    className="w-8 h-8 rounded border border-gray-600 hover:border-gray-400 transition-colors"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '6px 6px',
                      backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                    }}
                    title="Transparente"
                  />
                )}
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      "w-8 h-8 rounded border border-gray-600 hover:border-gray-400 transition-colors",
                      value === color && "ring-2 ring-blue-500"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
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
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#ffffff"
                  className="text-xs h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                />
                <input
                  type="color"
                  value={customColor === 'transparent' ? '#ffffff' : customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
