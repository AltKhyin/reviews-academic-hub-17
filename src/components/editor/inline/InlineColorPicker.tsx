
// ABOUTME: Compact inline color picker for block-level color customization
// Provides intuitive color selection with preset palette and custom options

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Pipette, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorOption {
  name: string;
  value: string;
  description?: string;
}

interface InlineColorPickerProps {
  colors: ColorOption[];
  onChange: (colorType: string, value: string) => void;
  readonly?: boolean;
  compact?: boolean;
  className?: string;
}

export const InlineColorPicker: React.FC<InlineColorPickerProps> = ({
  colors,
  onChange,
  readonly = false,
  compact = true,
  className = ''
}) => {
  const [activeColor, setActiveColor] = useState<string>('');

  const presetColors = [
    '#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
    '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  const handleColorSelect = (colorType: string, value: string) => {
    onChange(colorType, value);
  };

  const handleCustomColorChange = (colorType: string, value: string) => {
    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(value) || value === 'transparent') {
      onChange(colorType, value);
    }
  };

  const resetColor = (colorType: string) => {
    const defaultValues: Record<string, string> = {
      'text': '#ffffff',
      'background': 'transparent',
      'border': 'transparent',
      'accent': '#3b82f6'
    };
    
    const defaultValue = defaultValues[colorType.toLowerCase()] || 'transparent';
    onChange(colorType, defaultValue);
  };

  const getColorTypeKey = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z]/g, '');
  };

  if (readonly) {
    return (
      <div className={cn("inline-color-picker-readonly flex gap-2", className)}>
        {colors.map((color) => (
          <div key={color.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                borderColor: color.value === 'transparent' ? '#4b5563' : color.value
              }}
              title={`${color.name}: ${color.value}`}
            />
            <span className="text-xs" style={{ color: '#9ca3af' }}>
              {color.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("inline-color-picker space-y-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Palette className="w-4 h-4" style={{ color: '#3b82f6' }} />
        <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
          Cores do Bloco
        </span>
      </div>

      {colors.map((color) => {
        const colorKey = getColorTypeKey(color.name);
        
        return (
          <div key={color.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#d1d5db' }}>
                {color.name}
              </Label>
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded border cursor-pointer"
                  style={{ 
                    backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                    borderColor: color.value === 'transparent' ? '#4b5563' : color.value
                  }}
                  title={color.value}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetColor(colorKey)}
                  className="h-6 w-6 p-0"
                  title="Resetar cor"
                >
                  <RotateCcw className="w-3 h-3" style={{ color: '#9ca3af' }} />
                </Button>
              </div>
            </div>

            {compact ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 justify-start text-xs"
                    style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                  >
                    <Pipette className="w-3 h-3 mr-2" />
                    {color.value}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 p-3"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-9 gap-1">
                      {presetColors.map((presetColor) => (
                        <button
                          key={presetColor}
                          onClick={() => handleColorSelect(colorKey, presetColor)}
                          className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: presetColor,
                            borderColor: color.value === presetColor ? '#3b82f6' : '#4b5563'
                          }}
                          title={presetColor}
                        />
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: '#d1d5db' }}>
                        Cor personalizada
                      </Label>
                      <Input
                        value={color.value}
                        onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                        placeholder="#ffffff"
                        className="h-8 text-xs"
                        style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleColorSelect(colorKey, 'transparent')}
                      className="w-full h-8 text-xs"
                    >
                      Transparente
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-9 gap-1">
                  {presetColors.slice(0, 18).map((presetColor) => (
                    <button
                      key={presetColor}
                      onClick={() => handleColorSelect(colorKey, presetColor)}
                      className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: presetColor,
                        borderColor: color.value === presetColor ? '#3b82f6' : '#4b5563'
                      }}
                      title={presetColor}
                    />
                  ))}
                </div>
                
                <Input
                  value={color.value}
                  onChange={(e) => handleCustomColorChange(colorKey, e.target.value)}
                  placeholder="#ffffff ou transparent"
                  className="h-7 text-xs"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
