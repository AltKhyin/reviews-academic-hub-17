
// ABOUTME: Enhanced heading block with integrated inline settings, spacing controls and fixed text direction
// Handles heading levels 1-6 with comprehensive inline configuration and customizable spacing

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';
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
  // Safe access to content with fallbacks
  const content = block.content || {};
  const level = content.level || 1;
  const text = content.text || content.content || '';
  const alignment = content.alignment || 'left';

  // Color system integration with fallbacks
  const textColor = content.text_color || '#ffffff';
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
          text: newText,
          content: newText // Keep both for compatibility
        }
      });
    }
  };

  const getHeadingComponent = () => {
    const props = {
      className: cn(
        "font-bold leading-tight w-full max-w-full",
        "break-words hyphens-auto overflow-wrap-anywhere",
        getAlignmentClass(alignment),
        getSizeClass(level)
      ),
      style: {
        color: textColor,
        backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
        borderColor: borderColor !== 'transparent' ? borderColor : undefined,
        borderWidth: borderColor !== 'transparent' ? '1px' : undefined,
        borderStyle: borderColor !== 'transparent' ? 'solid' : undefined,
        direction: 'ltr' as const,
        textAlign: alignment as any,
        unicodeBidi: 'normal' as const,
        wordWrap: 'break-word' as const,
        wordBreak: 'break-word' as const,
        overflowWrap: 'break-word' as const,
        hyphens: 'auto' as const,
        maxWidth: '100%',
        width: '100%',
        ...spacingStyles
      },
      dir: 'ltr' as const
    };

    if (readonly) {
      const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;
      return <HeadingTag {...props}>{text}</HeadingTag>;
    }

    return (
      <InlineTextEditor
        value={text}
        onChange={handleTextChange}
        placeholder={`Heading ${level}`}
        tag={`h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements}
        style={props.style}
        className={props.className}
        disabled={readonly}
      />
    );
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

  const getSizeClass = (level: number) => {
    switch (level) {
      case 1:
        return 'text-4xl md:text-5xl';
      case 2:
        return 'text-3xl md:text-4xl';
      case 3:
        return 'text-2xl md:text-3xl';
      case 4:
        return 'text-xl md:text-2xl';
      case 5:
        return 'text-lg md:text-xl';
      case 6:
        return 'text-base md:text-lg';
      default:
        return 'text-2xl md:text-3xl';
    }
  };

  if (readonly) {
    return (
      <div className="heading-block w-full max-w-full overflow-hidden">
        {getHeadingComponent()}
      </div>
    );
  }

  return (
    <div className="heading-block group relative w-full max-w-full overflow-hidden">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div className="w-full max-w-full overflow-hidden">
        {getHeadingComponent()}
      </div>
    </div>
  );
};
