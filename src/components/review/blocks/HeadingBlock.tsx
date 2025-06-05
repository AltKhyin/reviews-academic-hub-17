
// ABOUTME: Enhanced heading block with inline editing and multiple levels
// Provides structured content hierarchy with direct click-to-edit functionality

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
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
  const level = payload.level || 1;
  const text = payload.text || '';
  const anchor = payload.anchor || '';

  const handleTextChange = (newText: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          text: newText,
          // Auto-generate anchor from text if not set
          anchor: anchor || newText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        }
      });
    }
  };

  const getHeadingStyles = (level: number) => {
    const baseStyles = "font-semibold leading-tight tracking-tight";
    
    switch (level) {
      case 1:
        return `${baseStyles} text-3xl md:text-4xl text-white`;
      case 2:
        return `${baseStyles} text-2xl md:text-3xl text-white`;
      case 3:
        return `${baseStyles} text-xl md:text-2xl text-white`;
      case 4:
        return `${baseStyles} text-lg md:text-xl text-gray-100`;
      case 5:
        return `${baseStyles} text-base md:text-lg text-gray-200`;
      case 6:
        return `${baseStyles} text-sm md:text-base text-gray-300`;
      default:
        return `${baseStyles} text-xl text-white`;
    }
  };

  const HeadingComponent = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;

  if (readonly) {
    return (
      <div className="heading-block my-6">
        <HeadingComponent
          id={anchor}
          className={cn(
            getHeadingStyles(level),
            "scroll-mt-20", // Account for fixed headers
            anchor && "group relative"
          )}
        >
          {text}
          {anchor && (
            <a
              href={`#${anchor}`}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: '#6b7280' }}
              aria-label="Link to this heading"
            >
              #
            </a>
          )}
        </HeadingComponent>
      </div>
    );
  }

  return (
    <div className="heading-block my-6">
      <HeadingComponent
        id={anchor}
        className={cn(
          getHeadingStyles(level),
          "scroll-mt-20",
          anchor && "group relative"
        )}
      >
        <InlineTextEditor
          value={text}
          onChange={handleTextChange}
          placeholder={`Título nível ${level}`}
          className={getHeadingStyles(level)}
          disabled={readonly}
        />
        {anchor && (
          <a
            href={`#${anchor}`}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: '#6b7280' }}
            aria-label="Link to this heading"
          >
            #
          </a>
        )}
      </HeadingComponent>
    </div>
  );
};
