
// ABOUTME: Enhanced paragraph block with integrated inline settings and fixed text direction
// Handles formatted text content with comprehensive inline configuration

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
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
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className="paragraph-block my-4 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div
        className={cn(
          "leading-relaxed p-3 rounded",
          getAlignmentClass(alignment),
          getEmphasisClass(emphasis),
          "prose prose-invert max-w-none"
        )}
        style={blockStyle}
        dir="ltr"
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
