
// ABOUTME: Enhanced heading block with inline editing and customizable spacing
// Supports H1-H6 levels with anchor links and comprehensive spacing controls using consistent colors

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';
import { cn } from '@/lib/utils';
import { CSS_VARIABLES, APP_COLORS } from '@/utils/colorSystem';

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
  const content = block.content;
  const level = content.level || 1;
  const text = content.text || '';
  const anchor = content.anchor || '';

  // Color system integration - use app colors instead of hardcoded values
  const textColor = content.text_color || APP_COLORS.TEXT_PRIMARY;
  const backgroundColor = content.background_color || 'transparent';
  const borderColor = content.border_color || 'transparent';

  // Spacing system integration
  const customSpacing = block.meta?.spacing;
  const defaultSpacing = getDefaultSpacing('heading');
  const finalSpacing = customSpacing || defaultSpacing;
  const spacingStyles = generateSpacingStyles(finalSpacing);

  const handleTextChange = (newText: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          text: newText
        }
      });
    }
  };

  const getHeadingClasses = (level: number) => {
    switch (level) {
      case 1:
        return 'text-3xl font-bold';
      case 2:
        return 'text-2xl font-semibold';
      case 3:
        return 'text-xl font-semibold';
      case 4:
        return 'text-lg font-medium';
      case 5:
        return 'text-base font-medium';
      case 6:
        return 'text-sm font-medium';
      default:
        return 'text-2xl font-semibold';
    }
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const headingStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderColor: borderColor !== 'transparent' ? borderColor : undefined,
    borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
    borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
    ...spacingStyles
  };

  if (readonly) {
    return (
      <div className="heading-block">
        <HeadingTag
          id={anchor}
          className={cn("leading-tight", getHeadingClasses(level))}
          style={headingStyle}
        >
          {text}
        </HeadingTag>
      </div>
    );
  }

  return (
    <div className="heading-block group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <HeadingTag
        id={anchor}
        className={cn("leading-tight", getHeadingClasses(level))}
        style={headingStyle}
      >
        <InlineTextEditor
          value={text}
          onChange={handleTextChange}
          placeholder={`Título H${level}`}
          disabled={readonly}
          style={{
            color: textColor,
            width: '100%'
          }}
        />
      </HeadingTag>
    </div>
  );
};
