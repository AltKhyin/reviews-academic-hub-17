
// ABOUTME: Enhanced figure block with comprehensive inline settings and color integration
// Handles image display with captions, alt text, and customizable styling

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
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

  // Color system integration
  const textColor = content.text_color || '#d1d5db';
  const backgroundColor = content.background_color || 'transparent';
  const borderColor = content.border_color || 'transparent';

  const handleFieldChange = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
    borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
  };

  const imageStyle: React.CSSProperties = {
    width: width === 'auto' ? 'auto' : width,
    maxWidth: '100%',
    height: 'auto'
  };

  if (readonly) {
    return (
      <div className="figure-block my-6">
        <div 
          className="rounded-lg p-4"
          style={containerStyle}
        >
          {src && (
            <div className="text-center">
              <img
                src={src}
                alt={alt}
                style={imageStyle}
                className="mx-auto rounded-md shadow-lg"
                loading="lazy"
              />
            </div>
          )}
          
          {caption && (
            <div 
              className="mt-3 text-sm text-center italic"
              style={{ color: textColor }}
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
        className="rounded-lg p-4"
        style={containerStyle}
      >
        {/* Image Source Editor */}
        <div className="mb-4">
          <InlineTextEditor
            value={src}
            onChange={(value) => handleFieldChange('src', value)}
            placeholder="URL da imagem (https://...)"
            className="w-full text-sm"
            readonly={readonly}
            style={{
              color: textColor,
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #2a2a2a'
            }}
          />
        </div>

        {/* Image Display */}
        {src ? (
          <div className="text-center">
            <img
              src={src}
              alt={alt || 'Imagem'}
              style={imageStyle}
              className="mx-auto rounded-md shadow-lg"
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
        <div className="mt-4">
          <InlineTextEditor
            value={alt}
            onChange={(value) => handleFieldChange('alt', value)}
            placeholder="Texto alternativo (acessibilidade)"
            className="w-full text-xs"
            readonly={readonly}
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
        <div className="mt-3">
          <InlineTextEditor
            value={caption}
            onChange={(value) => handleFieldChange('caption', value)}
            placeholder="Legenda da imagem"
            className="w-full text-sm text-center italic"
            readonly={readonly}
            style={{
              color: textColor
            }}
          />
        </div>
      </div>
    </div>
  );
};
