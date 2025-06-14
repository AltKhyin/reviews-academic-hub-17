// ABOUTME: Reviewer quote block with inline editing and comprehensive styling controls
// Displays reviewer quotes with author attribution and customizable appearance

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';
import { cn } from '@/lib/utils';
import { Quote } from 'lucide-react';

interface ReviewerQuoteProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const ReviewerQuote: React.FC<ReviewerQuoteProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  // Safe access to content with fallbacks
  const content = block.content || {};
  const quote = content.quote || '';
  const author = content.author || '';
  const role = content.role || '';
  const alignment = content.alignment || 'left';

  // Color system integration with fallbacks
  const textColor = content.text_color || '#d1d5db';
  const backgroundColor = content.background_color || '#1e293b';
  const borderColor = content.border_color || '#334155';

  // Spacing system integration
  const customSpacing = block.meta?.spacing;
  const defaultSpacing = getDefaultSpacing('reviewer_quote');
  const finalSpacing = customSpacing || defaultSpacing;
  const spacingStyles = generateSpacingStyles(finalSpacing);

  const handleQuoteChange = (newQuote: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          quote: newQuote
        }
      });
    }
  };

  const handleAuthorChange = (newAuthor: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          author: newAuthor
        }
      });
    }
  };

  const handleRoleChange = (newRole: string) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          role: newRole
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
      default:
        return 'text-left';
    }
  };

  const blockStyle: React.CSSProperties = {
    backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
    borderLeftColor: borderColor,
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    ...spacingStyles
  };

  if (readonly) {
    return (
      <div className="reviewer-quote-block w-full max-w-full overflow-hidden">
        <blockquote
          className={cn(
            "border-l-4 pl-6 py-4 rounded-r-lg w-full max-w-full",
            "break-words hyphens-auto overflow-wrap-anywhere",
            getAlignmentClass(alignment)
          )}
          style={blockStyle}
        >
          <div className="flex items-start gap-3 w-full max-w-full overflow-hidden">
            <Quote className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: borderColor }} />
            
            <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
              <p 
                className="text-lg italic leading-relaxed mb-3 break-words hyphens-auto overflow-wrap-anywhere"
                style={{ color: textColor }}
                dir="ltr"
              >
                "{quote}"
              </p>
              
              {(author || role) && (
                <div className={cn("text-sm", getAlignmentClass(alignment))}>
                  {author && (
                    <div 
                      className="font-medium break-words hyphens-auto overflow-wrap-anywhere"
                      style={{ color: textColor }}
                    >
                      — {author}
                    </div>
                  )}
                  {role && (
                    <div 
                      className="opacity-75 break-words hyphens-auto overflow-wrap-anywhere"
                      style={{ color: textColor }}
                    >
                      {role}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </blockquote>
      </div>
    );
  }

  return (
    <div className="reviewer-quote-block group relative w-full max-w-full overflow-hidden">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <blockquote
        className={cn(
          "border-l-4 pl-6 py-4 rounded-r-lg w-full max-w-full",
          "break-words hyphens-auto overflow-wrap-anywhere",
          getAlignmentClass(alignment)
        )}
        style={blockStyle}
      >
        <div className="flex items-start gap-3 w-full max-w-full overflow-hidden">
          <Quote className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: borderColor }} />
          
          <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
            <div className="mb-3 w-full max-w-full overflow-hidden">
              <InlineTextEditor
                value={quote}
                onChange={handleQuoteChange}
                placeholder="Digite a citação do revisor..."
                className="text-lg italic leading-relaxed break-words hyphens-auto overflow-wrap-anywhere"
                style={{ 
                  color: textColor,
                  direction: 'ltr',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  maxWidth: '100%',
                  width: '100%'
                }}
                disabled={readonly}
              />
            </div>
            
            <div className={cn("text-sm space-y-1", getAlignmentClass(alignment))}>
              <div className="w-full max-w-full overflow-hidden">
                <InlineTextEditor
                  value={author}
                  onChange={handleAuthorChange}
                  placeholder="Nome do autor"
                  className="font-medium break-words hyphens-auto overflow-wrap-anywhere"
                  style={{ 
                    color: textColor,
                    direction: 'ltr',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%',
                    width: '100%'
                  }}
                  disabled={readonly}
                />
              </div>
              
              <div className="w-full max-w-full overflow-hidden">
                <InlineTextEditor
                  value={role}
                  onChange={handleRoleChange}
                  placeholder="Função/cargo"
                  className="opacity-75 break-words hyphens-auto overflow-wrap-anywhere"
                  style={{ 
                    color: textColor,
                    direction: 'ltr',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%',
                    width: '100%'
                  }}
                  disabled={readonly}
                />
              </div>
            </div>
          </div>
        </div>
      </blockquote>
    </div>
  );
};
