
// ABOUTME: Enhanced paragraph block with integrated inline settings, spacing controls and fixed text direction
// Handles formatted text content with comprehensive inline configuration and customizable spacing

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';
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
  const content = block.content;
  const contentText = content.content || '';
  const alignment = content.alignment || 'left';
  const emphasis = content.emphasis || 'normal';

  // Color system integration
  const textColor = content.text_color || '#d1d5db';
  const backgroundColor = content.background_color || 'transparent';
  const borderColor = content.border_color || 'transparent';

  // Spacing system integration
  const customSpacing = block.meta?.spacing;
  const defaultSpacing = getDefaultSpacing('paragraph');
  const finalSpacing = customSpacing || defaultSpacing;
  const spacingStyles = generateSpacingStyles(finalSpacing);

  const handleContentChange = (newContent: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
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
    unicodeBidi: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    maxWidth: '100%',
    width: '100%',
    ...spacingStyles
  };

  if (readonly) {
    return (
      <div className="paragraph-block w-full">
        <div
          className={cn(
            "leading-relaxed p-3 rounded w-full max-w-full",
            "break-words hyphens-auto overflow-wrap-anywhere",
            getAlignmentClass(alignment),
            getEmphasisClass(emphasis),
            "prose prose-invert max-w-none"
          )}
          style={blockStyle}
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: contentText }}
        />
      </div>
    );
  }

  return (
    <div className="paragraph-block group relative w-full">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div
        className={cn(
          "leading-relaxed rounded w-full max-w-full",
          "break-words hyphens-auto overflow-wrap-anywhere",
          getAlignmentClass(alignment),
          getEmphasisClass(emphasis)
        )}
        style={blockStyle}
        dir="ltr"
      >
        <InlineRichTextEditor
          value={contentText}
          onChange={handleContentChange}
          placeholder="Digite seu conteúdo aqui..."
          disabled={readonly}
          style={{
            color: textColor,
            direction: 'ltr',
            textAlign: alignment,
            width: '100%',
            maxWidth: '100%',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            unicodeBidi: 'normal'
          }}
        />
      </div>
    </div>
  );
};
