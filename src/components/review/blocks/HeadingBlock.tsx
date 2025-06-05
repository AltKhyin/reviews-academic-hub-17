
// ABOUTME: Enhanced heading block with inline editing, level management, and integrated color editing
// Supports multiple heading levels with inline text editing and color customization

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineColorPicker } from '@/components/editor/inline/InlineColorPicker';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeadingBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const payload = block.payload;
  const text = payload.text || '';
  const level = payload.level || 1;
  const anchor = payload.anchor || '';

  // Color system integration
  const textColor = payload.text_color || '#ffffff';
  const backgroundColor = payload.background_color || 'transparent';
  const borderColor = payload.border_color || 'transparent';

  const handleTextChange = (newText: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          text: newText,
          // Auto-generate anchor from text if not manually set
          anchor: anchor || newText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }
      });
    }
  };

  const handleColorChange = (colorType: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [`${colorType}_color`]: value
        }
      });
    }
  };

  const getHeadingTag = () => {
    switch (level) {
      case 1: return 'h1';
      case 2: return 'h2';
      case 3: return 'h3';
      case 4: return 'h4';
      case 5: return 'h5';
      case 6: return 'h6';
      default: return 'h1';
    }
  };

  const getHeadingClass = () => {
    switch (level) {
      case 1: return 'text-4xl font-bold';
      case 2: return 'text-3xl font-bold';
      case 3: return 'text-2xl font-semibold';
      case 4: return 'text-xl font-semibold';
      case 5: return 'text-lg font-medium';
      case 6: return 'text-base font-medium';
      default: return 'text-4xl font-bold';
    }
  };

  const HeadingTag = getHeadingTag() as keyof JSX.IntrinsicElements;

  const headingStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
    borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
    direction: 'ltr',
    unicodeBidi: 'normal'
  };

  const colorOptions = [
    { name: 'Texto', value: textColor, description: 'Cor do texto do cabeçalho' },
    { name: 'Fundo', value: backgroundColor, description: 'Cor de fundo do cabeçalho' },
    { name: 'Borda', value: borderColor, description: 'Cor da borda do cabeçalho' }
  ];

  if (readonly) {
    return (
      <div className="heading-block my-6">
        <HeadingTag
          id={anchor}
          className={cn(
            getHeadingClass(),
            "leading-tight"
          )}
          style={headingStyle}
        >
          {text}
        </HeadingTag>
      </div>
    );
  }

  return (
    <div className="heading-block my-6 group relative">
      {/* Inline Settings Toggle */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="h-6 w-6 p-0 hover:bg-gray-700 rounded-full"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
          title="Configurações do bloco"
        >
          <Settings className="w-3 h-3" style={{ color: '#9ca3af' }} />
        </Button>
      </div>

      {/* Inline Color Picker */}
      {showSettings && (
        <div className="mb-3 p-2 rounded border animate-in slide-in-from-top-2"
             style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <InlineColorPicker
            colors={colorOptions}
            onChange={handleColorChange}
            readonly={readonly}
            compact={false}
          />
        </div>
      )}

      <HeadingTag
        id={anchor}
        className={cn(
          getHeadingClass(),
          "leading-tight"
        )}
        style={headingStyle}
      >
        <InlineTextEditor
          value={text}
          onChange={handleTextChange}
          placeholder={`Título nível ${level}`}
          className="w-full"
          readonly={readonly}
        />
      </HeadingTag>
    </div>
  );
};
