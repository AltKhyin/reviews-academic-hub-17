
// ABOUTME: Enhanced paragraph block with rich text support and inline editing
// Handles formatted text content with direct click-to-edit functionality

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
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
        return 'text-lg font-medium text-gray-100';
      case 'small':
        return 'text-sm text-gray-300';
      case 'caption':
        return 'text-xs text-gray-400 italic';
      default:
        return 'text-base text-gray-200';
    }
  };

  if (readonly) {
    return (
      <div className="paragraph-block my-4">
        <div
          className={cn(
            "leading-relaxed",
            getAlignmentClass(alignment),
            getEmphasisClass(emphasis),
            "prose prose-invert max-w-none"
          )}
          style={{ direction: 'ltr', textAlign: alignment === 'left' ? 'left' : alignment }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className="paragraph-block my-4">
      <div
        className={cn(
          "leading-relaxed",
          getAlignmentClass(alignment),
          getEmphasisClass(emphasis),
          "prose prose-invert max-w-none"
        )}
        style={{ direction: 'ltr', textAlign: alignment === 'left' ? 'left' : alignment }}
      >
        <InlineRichTextEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Digite seu conteúdo aqui..."
          disabled={readonly}
        />
      </div>
    </div>
  );
};
