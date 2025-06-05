
// ABOUTME: Enhanced heading block with integrated inline settings and improved text direction
// Supports multiple heading levels with comprehensive inline configuration

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
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
    textAlign: 'left',
    unicodeBidi: 'normal'
  };

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
          dir="ltr"
        >
          {text}
        </HeadingTag>
      </div>
    );
  }

  return (
    <div className="heading-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <HeadingTag
        id={anchor}
        className={cn(
          getHeadingClass(),
          "leading-tight"
        )}
        style={headingStyle}
        dir="ltr"
      >
        <InlineTextEditor
          value={text}
          onChange={handleTextChange}
          placeholder={`Título nível ${level}`}
          className="w-full"
          readonly={readonly}
          style={{
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'normal'
          }}
        />
      </HeadingTag>
    </div>
  );
};
