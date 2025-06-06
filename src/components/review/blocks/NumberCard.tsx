
// ABOUTME: Refactored number card with extracted components for better maintainability
// Main number card container using focused sub-components

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { NumberCardConfig } from './number-card/NumberCardConfig';
import { NumberCardDisplay } from './number-card/NumberCardDisplay';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NumberCardProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const NumberCard: React.FC<NumberCardProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  // Safe access to content with comprehensive fallbacks
  const content = block.content || {};
  const number = content.number || '0';
  const label = content.label || 'Métrica';
  const description = content.description || '';
  const subtitle = content.subtitle || '';
  const trend = content.trend || 'neutral';
  const percentage = content.percentage || 0;
  const previousValue = content.previous_value || '';
  const targetValue = content.target_value || '';
  const unit = content.unit || '';
  const numberFormat = content.number_format || 'integer';
  const cardStyle = content.card_style || 'default';
  const size = content.size || 'normal';
  const showComparison = content.show_comparison ?? false;
  const showTarget = content.show_target ?? false;
  const showIcon = content.show_icon ?? true;
  const customIcon = content.custom_icon || 'BarChart3';

  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#3b82f6';
  const numberColor = content.number_color || textColor;
  const labelColor = content.label_color || textColor;

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  if (readonly) {
    return (
      <div className="number-card-block my-6">
        <NumberCardDisplay
          number={number}
          label={label}
          description={description}
          subtitle={subtitle}
          trend={trend}
          percentage={percentage}
          previousValue={previousValue}
          targetValue={targetValue}
          unit={unit}
          numberFormat={numberFormat}
          cardStyle={cardStyle}
          size={size}
          showComparison={showComparison}
          showTarget={showTarget}
          showIcon={showIcon}
          customIcon={customIcon}
          textColor={textColor}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          accentColor={accentColor}
          numberColor={numberColor}
          labelColor={labelColor}
        />
      </div>
    );
  }

  return (
    <div className="number-card-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div className="space-y-4">
        {/* Configuration Panel */}
        <NumberCardConfig
          numberFormat={numberFormat}
          size={size}
          cardStyle={cardStyle}
          showIcon={showIcon}
          showComparison={showComparison}
          showTarget={showTarget}
          customIcon={customIcon}
          trend={trend}
          percentage={percentage}
          textColor={textColor}
          borderColor={borderColor}
          onUpdate={handleUpdate}
        />

        {/* Main Card with Editable Content */}
        <NumberCardDisplay
          number={number}
          label={label}
          description={description}
          subtitle={subtitle}
          trend={trend}
          percentage={percentage}
          previousValue={previousValue}
          targetValue={targetValue}
          unit={unit}
          numberFormat={numberFormat}
          cardStyle={cardStyle}
          size={size}
          showComparison={showComparison}
          showTarget={showTarget}
          showIcon={showIcon}
          customIcon={customIcon}
          textColor={textColor}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          accentColor={accentColor}
          numberColor={numberColor}
          labelColor={labelColor}
        />

        {/* Additional Editors for Comparison/Target Values */}
        {(showComparison || showTarget) && (
          <div className="pt-4 border-t space-y-3" style={{ borderColor: borderColor }}>
            {showComparison && (
              <div>
                <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                  Valor Anterior
                </Label>
                <InlineTextEditor
                  value={previousValue}
                  onChange={(value) => handleUpdate('previous_value', value)}
                  placeholder="Valor anterior"
                  className="w-full text-sm mt-1"
                  style={{ color: textColor }}
                />
              </div>
            )}
            
            {showTarget && (
              <div>
                <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                  Meta
                </Label>
                <InlineTextEditor
                  value={targetValue}
                  onChange={(value) => handleUpdate('target_value', value)}
                  placeholder="Valor da meta"
                  className="w-full text-sm mt-1"
                  style={{ color: textColor }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
