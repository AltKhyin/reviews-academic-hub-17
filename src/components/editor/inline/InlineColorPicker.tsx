
// ABOUTME: Compact inline color picker for block-level color editing
// Provides immediate color feedback with expandable palette options

import React, { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  compact = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  if (readonly) return null;

  const handleColorChange = (colorType: string, value: string) => {
    onChange(colorType, value);
  };

  const ColorSwatch: React.FC<{ 
    color: ColorOption; 
    size?: 'sm' | 'md' | 'lg' 
  }> = ({ color, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "p-1 border-2 border-gray-600 hover:border-gray-400 rounded transition-all",
              sizeClasses[size]
            )}
            style={{ backgroundColor: color.value === 'transparent' ? '#1a1a1a' : color.value }}
            title={color.description || `Alterar ${color.name}`}
          >
            {color.value === 'transparent' && (
              <div className="w-full h-full bg-gradient-to-br from-red-500 via-transparent to-blue-500 opacity-30 rounded" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-3"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
              {color.name}
            </Label>
            <div className="space-y-2">
              <Input
                type="color"
                value={color.value === 'transparent' ? '#000000' : color.value}
                onChange={(e) => handleColorChange(color.name.toLowerCase().replace(/\s+/g, '_'), e.target.value)}
                className="h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={color.value}
                onChange={(e) => handleColorChange(color.name.toLowerCase().replace(/\s+/g, '_'), e.target.value)}
                placeholder="Hex, RGB, ou transparent"
                className="text-sm"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
              {color.value !== 'transparent' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange(color.name.toLowerCase().replace(/\s+/g, '_'), 'transparent')}
                  className="w-full text-xs"
                >
                  Tornar Transparente
                </Button>
              )}
            </div>
            {color.description && (
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                {color.description}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (compact) {
    return (
      <div className={cn("inline-color-picker-compact flex items-center gap-1", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0 hover:bg-gray-700"
          title="Editar cores"
        >
          <Palette className="w-3 h-3" style={{ color: '#9ca3af' }} />
        </Button>
        {isExpanded && (
          <div className="flex gap-1 animate-in slide-in-from-left-2">
            {colors.slice(0, 3).map((color, index) => (
              <ColorSwatch key={index} color={color} size="sm" />
            ))}
            {colors.length > 3 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 text-xs hover:bg-gray-700"
                    style={{ color: '#9ca3af' }}
                  >
                    +{colors.length - 3}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-48 p-2"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {colors.slice(3).map((color, index) => (
                      <ColorSwatch key={index + 3} color={color} size="sm" />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("inline-color-picker space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: '#3b82f6' }} />
          <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Cores do Bloco
          </Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0 hover:bg-gray-700"
        >
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" style={{ color: '#9ca3af' }} />
          ) : (
            <ChevronDown className="w-3 h-3" style={{ color: '#9ca3af' }} />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-3 gap-2 p-2 rounded border animate-in slide-in-from-top-2"
             style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
          {colors.map((color, index) => (
            <div key={index} className="text-center">
              <ColorSwatch color={color} size="md" />
              <Label className="text-xs mt-1 block" style={{ color: '#9ca3af' }}>
                {color.name}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
