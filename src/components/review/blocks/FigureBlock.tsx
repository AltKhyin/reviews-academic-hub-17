
// ABOUTME: Enhanced figure block with comprehensive inline settings and color integration
// Handles image display with captions, alt text, and customizable styling with full control

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FigureBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const FigureBlock: React.FC<FigureBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const src = content.src || '';
  const alt = content.alt || '';
  const caption = content.caption || '';
  const width = content.width || 'auto';
  const height = content.height || 'auto';
  const alignment = content.alignment || 'center';
  const borderRadius = content.border_radius || 8;
  const showCaption = content.show_caption !== false;

  // Color system integration
  const textColor = content.text_color || '#d1d5db';
  const backgroundColor = content.background_color || 'transparent';
  const borderColor = content.border_color || 'transparent';
  const captionColor = content.caption_color || '#9ca3af';

  const handleFieldChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const alignmentOptions = [
    { value: 'left', label: 'Esquerda', icon: AlignLeft },
    { value: 'center', label: 'Centro', icon: AlignCenter },
    { value: 'right', label: 'Direita', icon: AlignRight }
  ];

  const sizePresets = [
    { value: 'auto', label: 'Automático' },
    { value: '25%', label: 'Pequeno (25%)' },
    { value: '50%', label: 'Médio (50%)' },
    { value: '75%', label: 'Grande (75%)' },
    { value: '100%', label: 'Largura Total' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const containerStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
    borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
    textAlign: alignment as any
  };

  const imageStyle: React.CSSProperties = {
    width: width === 'auto' ? 'auto' : width,
    height: height === 'auto' ? 'auto' : height,
    maxWidth: '100%',
    borderRadius: `${borderRadius}px`,
    display: alignment === 'center' ? 'block' : 'inline-block',
    margin: alignment === 'center' ? '0 auto' : undefined
  };

  const captionStyle: React.CSSProperties = {
    color: captionColor,
    textAlign: alignment as any,
    marginTop: showCaption ? '12px' : 0
  };

  if (readonly) {
    return (
      <div className="figure-block my-6">
        <div 
          className="rounded-lg p-4"
          style={containerStyle}
        >
          {src && (
            <div>
              <img
                src={src}
                alt={alt}
                style={imageStyle}
                className="shadow-lg"
                loading="lazy"
              />
            </div>
          )}
          
          {showCaption && caption && (
            <div 
              className="text-sm italic"
              style={captionStyle}
            >
              {caption}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="figure-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div 
        className="rounded-lg p-4 space-y-4"
        style={containerStyle}
      >
        {/* Image Configuration Panel */}
        <div 
          className="p-4 rounded border space-y-4"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderColor: '#2a2a2a'
          }}
        >
          {/* Image Source */}
          <div>
            <Label className="text-xs font-medium" style={{ color: textColor }}>
              URL da Imagem
            </Label>
            <InlineTextEditor
              value={src}
              onChange={(value) => handleFieldChange('src', value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full text-sm mt-1"
              style={{
                color: textColor,
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #2a2a2a'
              }}
            />
          </div>

          {/* Size Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium" style={{ color: textColor }}>
                Largura
              </Label>
              <Select value={width} onValueChange={(value) => handleFieldChange('width', value)}>
                <SelectTrigger 
                  className="mt-1"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {sizePresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {width === 'custom' && (
                <Input
                  value={content.custom_width || ''}
                  onChange={(e) => handleFieldChange('custom_width', e.target.value)}
                  placeholder="400px ou 50%"
                  className="mt-2 text-xs"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                />
              )}
            </div>

            <div>
              <Label className="text-xs font-medium" style={{ color: textColor }}>
                Altura
              </Label>
              <Input
                value={height}
                onChange={(e) => handleFieldChange('height', e.target.value)}
                placeholder="auto, 300px, etc."
                className="mt-1 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
              />
            </div>
          </div>

          {/* Alignment Controls */}
          <div>
            <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
              Alinhamento
            </Label>
            <div className="flex gap-1">
              {alignmentOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={alignment === option.value ? "default" : "outline"}
                    onClick={() => handleFieldChange('alignment', option.value)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <IconComponent className="w-3 h-3" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <Label className="text-xs font-medium" style={{ color: textColor }}>
              Borda Arredondada: {borderRadius}px
            </Label>
            <input
              type="range"
              min="0"
              max="24"
              value={borderRadius}
              onChange={(e) => handleFieldChange('border_radius', parseInt(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          {/* Caption Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-caption"
              checked={showCaption}
              onChange={(e) => handleFieldChange('show_caption', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="show-caption" className="text-xs" style={{ color: textColor }}>
              Mostrar legenda
            </Label>
          </div>
        </div>

        {/* Image Display */}
        {src ? (
          <div>
            <img
              src={src}
              alt={alt || 'Imagem'}
              style={imageStyle}
              className="shadow-lg transition-all duration-200"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div 
            className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center"
            style={{ borderColor: '#2a2a2a', backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <div className="text-sm" style={{ color: '#9ca3af' }}>
                Cole a URL da imagem acima
              </div>
            </div>
          </div>
        )}

        {/* Alt Text Editor */}
        <div>
          <Label className="text-xs font-medium" style={{ color: textColor }}>
            Texto Alternativo (Acessibilidade)
          </Label>
          <InlineTextEditor
            value={alt}
            onChange={(value) => handleFieldChange('alt', value)}
            placeholder="Descrição da imagem para leitores de tela"
            className="w-full text-xs mt-1"
            style={{
              color: textColor,
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #2a2a2a'
            }}
          />
        </div>

        {/* Caption Editor */}
        {showCaption && (
          <div>
            <Label className="text-xs font-medium" style={{ color: textColor }}>
              Legenda da Imagem
            </Label>
            <InlineTextEditor
              value={caption}
              onChange={(value) => handleFieldChange('caption', value)}
              placeholder="Digite a legenda aqui..."
              multiline
              className="w-full text-sm italic mt-1"
              style={captionStyle}
            />
          </div>
        )}
      </div>
    </div>
  );
};
