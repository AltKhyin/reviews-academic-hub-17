
// ABOUTME: Enhanced snapshot card block with improved null safety and text overflow handling
// Displays PICO evidence cards with comprehensive styling and layout controls

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { SnapshotCard } from './SnapshotCard';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { generateSpacingStyles, getDefaultSpacing } from '@/utils/spacingUtils';

interface SnapshotCardBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const SnapshotCardBlock: React.FC<SnapshotCardBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  // Safe access to content with fallbacks
  const content = block.content || {};
  
  // Ensure all required properties have fallbacks
  const snapshotContent = {
    title: content.title || '',
    subtitle: content.subtitle || '',
    value: content.value || '',
    change: content.change || '',
    trend: content.trend || 'neutral',
    icon: content.icon || '',
    evidence_level: content.evidence_level || 'moderate',
    recommendation_strength: content.recommendation_strength || 'conditional',
    population: content.population || '',
    intervention: content.intervention || '',
    comparison: content.comparison || '',
    outcome: content.outcome || '',
    design: content.design || '',
    key_findings: Array.isArray(content.key_findings) ? content.key_findings : []
  };

  // Spacing system integration
  const customSpacing = block.meta?.spacing;
  const defaultSpacing = getDefaultSpacing('snapshot_card');
  const finalSpacing = customSpacing || defaultSpacing;
  const spacingStyles = generateSpacingStyles(finalSpacing);

  const handleUpdate = (updates: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          ...updates
        }
      });
    }
  };

  if (readonly) {
    return (
      <div className="snapshot-card-block w-full max-w-full overflow-hidden" style={spacingStyles}>
        <SnapshotCard
          content={snapshotContent}
          readonly={true}
        />
      </div>
    );
  }

  return (
    <div className="snapshot-card-block group relative w-full max-w-full overflow-hidden" style={spacingStyles}>
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <SnapshotCard
        content={snapshotContent}
        onUpdate={handleUpdate}
        readonly={readonly}
      />
    </div>
  );
};
