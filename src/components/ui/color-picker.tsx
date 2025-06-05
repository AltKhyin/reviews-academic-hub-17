
// ABOUTME: Advanced color picker component with hex input, alpha support, and proper UX
// Provides comprehensive color selection with draggable interface and transparency control

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  showAlpha?: boolean;
  className?: string;
}

interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  description,
  showAlpha = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [alpha, setAlpha] = useState(100);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);

  // Parse color value to get alpha if present
  useEffect(() => {
    if (value.startsWith('#')) {
      setHexInput(value);
      if (value.length === 9) {
        // Extract alpha from 8-digit hex
        const alphaHex = value.slice(7, 9);
        const alphaValue = Math.round((parseInt(alphaHex, 16) / 255) * 100);
        setAlpha(alphaValue);
      } else {
        setAlpha(100);
      }
    }
  }, [value]);

  // Color conversion utilities
  const hexToRgb = useCallback((hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }, []);

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }, []);

  const rgbToHsv = useCallback((r: number, g: number, b: number): HSV => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : (diff / max) * 100;
    const v = max * 100;
    
    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / diff + 2) * 60;
          break;
        case b:
          h = ((r - g) / diff + 4) * 60;
          break;
      }
    }
    
    return { h, s, v };
  }, []);

  const hsvToRgb = useCallback((h: number, s: number, v: number): RGB => {
    s /= 100;
    v /= 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }, []);

  // Draw color picker canvas
  const drawColorPicker = useCallback((hue: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Create base color at current hue
    const baseColor = hsvToRgb(hue, 100, 100);
    
    // Draw saturation-value gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s = (x / width) * 100;
        const v = ((height - y) / height) * 100;
        const rgb = hsvToRgb(hue, s, v);
        
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hsvToRgb]);

  // Draw hue slider
  const drawHueSlider = useCallback(() => {
    const canvas = hueRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    for (let x = 0; x < width; x++) {
      const hue = (x / width) * 360;
      const rgb = hsvToRgb(hue, 100, 100);
      ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.fillRect(x, 0, 1, height);
    }
  }, [hsvToRgb]);

  // Initialize canvases
  useEffect(() => {
    drawHueSlider();
    drawColorPicker(0);
  }, [drawHueSlider, drawColorPicker]);

  // Handle color picker mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, ((e.clientX - rect.left) / rect.width) * canvas.width));
    const y = Math.max(0, Math.min(canvas.height, ((e.clientY - rect.top) / rect.height) * canvas.height));
    
    const s = (x / canvas.width) * 100;
    const v = ((canvas.height - y) / canvas.height) * 100;
    
    // Get current hue from hue slider
    const currentRgb = hexToRgb(hexInput);
    if (currentRgb) {
      const currentHsv = rgbToHsv(currentRgb.r, currentRgb.g, currentRgb.b);
      const newRgb = hsvToRgb(currentHsv.h, s, v);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      
      setHexInput(newHex);
      onChange(showAlpha && alpha < 100 ? 
        newHex + Math.round((alpha / 100) * 255).toString(16).padStart(2, '0') : 
        newHex
      );
    }
  }, [isDragging, hexInput, hexToRgb, rgbToHsv, hsvToRgb, rgbToHex, onChange, showAlpha, alpha]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle hex input change
  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      onChange(showAlpha && alpha < 100 ? 
        newHex + Math.round((alpha / 100) * 255).toString(16).padStart(2, '0') : 
        newHex
      );
    }
  }, [onChange, showAlpha, alpha]);

  // Handle alpha change
  const handleAlphaChange = useCallback((newAlpha: number[]) => {
    const alphaValue = newAlpha[0];
    setAlpha(alphaValue);
    
    if (/^#[0-9A-F]{6}$/i.test(hexInput)) {
      onChange(alphaValue < 100 ? 
        hexInput + Math.round((alphaValue / 100) * 255).toString(16).padStart(2, '0') : 
        hexInput
      );
    }
  }, [hexInput, onChange]);

  // Add global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const syntheticEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation()
        } as React.MouseEvent;
        handleMouseMove(syntheticEvent);
      };
      
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
            {label}
          </Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 border-2"
                style={{
                  backgroundColor: value,
                  borderColor: 'var(--editor-primary-border)'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              />
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-4" 
              style={{
                backgroundColor: 'var(--editor-card-bg)',
                borderColor: 'var(--editor-primary-border)'
              }}
              onPointerDownOutside={(e) => {
                // Prevent closing when interacting with picker
                if (pickerRef.current?.contains(e.target as Node)) {
                  e.preventDefault();
                }
              }}
            >
              <div ref={pickerRef} className="space-y-4">
                {/* Color Picker Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={240}
                    height={150}
                    className="border rounded cursor-crosshair"
                    style={{ borderColor: 'var(--editor-primary-border)' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  />
                </div>
                
                {/* Hue Slider */}
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--editor-muted-text)]">Hue</Label>
                  <canvas
                    ref={hueRef}
                    width={240}
                    height={20}
                    className="border rounded cursor-pointer"
                    style={{ borderColor: 'var(--editor-primary-border)' }}
                  />
                </div>
                
                {/* Alpha Slider */}
                {showAlpha && (
                  <div className="space-y-2">
                    <Label className="text-xs text-[var(--editor-muted-text)]">
                      Transparency: {alpha}%
                    </Label>
                    <Slider
                      value={[alpha]}
                      onValueChange={handleAlphaChange}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
                
                {/* Hex Input */}
                <div className="space-y-2">
                  <Label htmlFor="hex-input" className="text-xs text-[var(--editor-muted-text)]">
                    Hex Code
                  </Label>
                  <Input
                    id="hex-input"
                    value={hexInput}
                    onChange={handleHexChange}
                    placeholder="#000000"
                    className="font-mono text-sm"
                  />
                </div>
                
                {/* Preview */}
                <div className="flex items-center gap-2 pt-2">
                  <div 
                    className="w-6 h-6 rounded border-2"
                    style={{ 
                      backgroundColor: value,
                      borderColor: 'var(--editor-primary-border)'
                    }}
                  />
                  <span className="text-xs font-mono text-[var(--editor-muted-text)]">
                    {value}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {description && (
        <p className="text-xs text-[var(--editor-muted-text)]">{description}</p>
      )}
      
      {!label && (
        <Input
          value={hexInput}
          onChange={handleHexChange}
          placeholder="#000000"
          className="font-mono"
        />
      )}
    </div>
  );
};
