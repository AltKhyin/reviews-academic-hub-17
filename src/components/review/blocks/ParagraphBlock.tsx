
// ABOUTME: Enhanced paragraph block with proper text direction and integrated inline color editing
// Handles formatted text content with comprehensive color customization directly in the block

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineColorPicker } from '@/components/editor/inline/InlineColorPicker';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ParagraphBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const payload = block.payload;
  const content = payload.content || '';
  const alignment = payload.alignment || 'left';
  const emphasis = payload.emphasis || 'normal';

  // Color system integration
  const textColor = payload.text_color || '#d1d5db';
  const backgroundColor = payload.background_color || 'transparent';
  const borderColor = payload.border_color || 'transparent';

  const handleContentChange = (newContent: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          content: newContent
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

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

  const getEmphasisClass = (emphasis: string) => {
    switch (emphasis) {
      case 'lead':
        return 'text-lg font-medium';
      case 'small':
        return 'text-sm';
      case 'caption':
        return 'text-xs italic';
      default:
        return 'text-base';
    }
  };

  const blockStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
    borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
    direction: 'ltr',
    textAlign: alignment as any,
    unicodeBidi: 'normal'
  };

  const colorOptions = [
    { name: 'Texto', value: textColor, description: 'Cor principal do texto' },
    { name: 'Fundo', value: backgroundColor, description: 'Cor de fundo do parágrafo' },
    { name: 'Borda', value: borderColor, description: 'Cor da borda do parágrafo' }
  ];

  if (readonly) {
    return (
      <div className="paragraph-block my-4">
        <div
          className={cn(
            "leading-relaxed p-3 rounded",
            getAlignmentClass(alignment),
            getEmphasisClass(emphasis),
            "prose prose-invert max-w-none"
          )}
          style={blockStyle}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className="paragraph-block my-4 group relative">
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

      <div
        className={cn(
          "leading-relaxed p-3 rounded",
          getAlignmentClass(alignment),
          getEmphasisClass(emphasis),
          "prose prose-invert max-w-none"
        )}
        style={blockStyle}
      >
        <InlineRichTextEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Digite seu conteúdo aqui..."
          disabled={readonly}
          style={{
            color: textColor,
            direction: 'ltr',
            textAlign: alignment,
            width: '100%',
            unicodeBidi: 'normal'
          }}
        />
      </div>
    </div>
  );
};
