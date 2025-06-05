
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

// Color presets for quick selection
const COLOR_PRESETS = [
  { name: 'Pure Black', value: '#000000' },
  { name: 'Dark Gray', value: '#1a1a1a' },
  { name: 'Medium Gray', value: '#404040' },
  { name: 'Light Gray', value: '#a3a3a3' },
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

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
  const [currentHue, setCurrentHue] = useState(0);
  const [currentHsv, setCurrentHsv] = useState<HSV>({ h: 0, s: 0, v: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

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

  // Initialize color values from hex
  useEffect(() => {
    if (value.startsWith('#')) {
      setHexInput(value);
      const rgb = hexToRgb(value);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setCurrentHsv(hsv);
        setCurrentHue(hsv.h);
      }
      
      if (value.length === 9) {
        const alphaHex = value.slice(7, 9);
        const alphaValue = Math.round((parseInt(alphaHex, 16) / 255) * 100);
        setAlpha(alphaValue);
      } else {
        setAlpha(100);
      }
    }
  }, [value, hexToRgb, rgbToHsv]);

  // Draw color picker canvas
  const drawColorPicker = useCallback((hue: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create saturation-value gradient
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const s = (x / width) * 100;
        const v = ((height - y) / height) * 100;
        const rgb = hsvToRgb(hue, s, v);
        
        const index = (y * width + x) * 4;
        data[index] = rgb.r;     // Red
        data[index + 1] = rgb.g; // Green
        data[index + 2] = rgb.b; // Blue
        data[index + 3] = 255;   // Alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [hsvToRgb]);

  // Draw hue slider
  const drawHueSlider = useCallback(() => {
    const canvas = hueRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ff0000');     // Red
    gradient.addColorStop(0.17, '#ffff00');  // Yellow
    gradient.addColorStop(0.33, '#00ff00');  // Green
    gradient.addColorStop(0.5, '#00ffff');   // Cyan
    gradient.addColorStop(0.67, '#0000ff');  // Blue
    gradient.addColorStop(0.83, '#ff00ff');  // Magenta
    gradient.addColorStop(1, '#ff0000');     // Red
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  // Initialize canvases
  useEffect(() => {
    drawHueSlider();
    drawColorPicker(currentHue);
  }, [drawHueSlider, drawColorPicker, currentHue]);

  // Update cursor position
  const updateCursorPosition = useCallback(() => {
    if (!cursorRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const x = (currentHsv.s / 100) * canvas.width;
    const y = ((100 - currentHsv.v) / 100) * canvas.height;
    
    cursorRef.current.style.left = `${x - 6}px`;
    cursorRef.current.style.top = `${y - 6}px`;
  }, [currentHsv]);

  useEffect(() => {
    updateCursorPosition();
  }, [updateCursorPosition]);

  // Handle color picker mouse events
  const handleColorPickerClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, ((e.clientX - rect.left) / rect.width) * canvas.width));
    const y = Math.max(0, Math.min(canvas.height, ((e.clientY - rect.top) / rect.height) * canvas.height));
    
    const s = (x / canvas.width) * 100;
    const v = ((canvas.height - y) / canvas.height) * 100;
    
    const newHsv = { h: currentHue, s, v };
    setCurrentHsv(newHsv);
    
    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    setHexInput(newHex);
    onChange(showAlpha && alpha < 100 ? 
      newHex + Math.round((alpha / 100) * 255).toString(16).padStart(2, '0') : 
      newHex
    );
  }, [currentHue, hsvToRgb, rgbToHex, onChange, showAlpha, alpha]);

  // Handle hue slider click
  const handleHueClick = useCallback((e: React.MouseEvent) => {
    const canvas = hueRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
    const hue = (x / canvas.width) * 360;
    
    setCurrentHue(hue);
    const newHsv = { ...currentHsv, h: hue };
    setCurrentHsv(newHsv);
    
    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    setHexInput(newHex);
    onChange(showAlpha && alpha < 100 ? 
      newHex + Math.round((alpha / 100) * 255).toString(16).padStart(2, '0') : 
      newHex
    );
  }, [currentHsv, hsvToRgb, rgbToHex, onChange, showAlpha, alpha]);

  // Handle hex input change
  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      const rgb = hexToRgb(newHex);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setCurrentHsv(hsv);
        setCurrentHue(hsv.h);
      }
      
      onChange(showAlpha && alpha < 100 ? 
        newHex + Math.round((alpha / 100) * 255).toString(16).padStart(2, '0') : 
        newHex
      );
    }
  }, [onChange, showAlpha, alpha, hexToRgb, rgbToHsv]);

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

  // Handle preset selection
  const handlePresetSelect = useCallback((presetValue: string) => {
    setHexInput(presetValue);
    onChange(presetValue);
    
    const rgb = hexToRgb(presetValue);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setCurrentHsv(hsv);
      setCurrentHue(hsv.h);
    }
  }, [onChange, hexToRgb, rgbToHsv]);

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
                className="w-8 h-8 p-0 border-2 cursor-pointer hover:scale-105 transition-transform"
                style={{
                  backgroundColor: value,
                  borderColor: 'var(--editor-primary-border)'
                }}
              />
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-4 z-50" 
              style={{
                backgroundColor: 'var(--editor-card-bg)',
                borderColor: 'var(--editor-primary-border)'
              }}
            >
              <div className="space-y-4">
                {/* Color Picker Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={240}
                    height={150}
                    className="border rounded cursor-crosshair block"
                    style={{ borderColor: 'var(--editor-primary-border)' }}
                    onClick={handleColorPickerClick}
                  />
                  <div
                    ref={cursorRef}
                    className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
                    style={{
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
                
                {/* Hue Slider */}
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--editor-muted-text)]">Hue</Label>
                  <canvas
                    ref={hueRef}
                    width={240}
                    height={20}
                    className="border rounded cursor-pointer block"
                    style={{ borderColor: 'var(--editor-primary-border)' }}
                    onClick={handleHueClick}
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
                
                {/* Color Presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--editor-muted-text)]">Presets</Label>
                  <div className="grid grid-cols-6 gap-1">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: preset.value,
                          borderColor: preset.value === value ? 'var(--editor-focus-border)' : 'var(--editor-primary-border)'
                        }}
                        onClick={() => handlePresetSelect(preset.value)}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
                
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
                    style={{
                      backgroundColor: 'var(--editor-surface-bg)',
                      borderColor: 'var(--editor-primary-border)',
                      color: 'var(--editor-primary-text)'
                    }}
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
