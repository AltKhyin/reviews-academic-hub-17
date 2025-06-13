
// ABOUTME: Snapshot card block wrapper with proper interface handling
// Fixed to handle both block and content prop patterns

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { SnapshotCard } from './SnapshotCard';

interface SnapshotCardBlockProps {
  block?: ReviewBlock;
  content?: any;
  onUpdate?: (updates: any) => void;
  readonly?: boolean;
}

export const SnapshotCardBlock: React.FC<SnapshotCardBlockProps> = ({
  block,
  content,
  onUpdate,
  readonly = false
}) => {
  // Handle both patterns - direct content prop or block with content
  if (content) {
    // Direct content pattern
    const blockData: ReviewBlock = {
      id: 'temp-snapshot',
      type: 'snapshot_card',
      content: {
        title: content.title,
        subtitle: content.subtitle,
        value: content.value,
        description: content.description,
        color: content.color,
        icon: content.icon,
        trend: {
          direction: content.change > 0 ? 'up' : content.change < 0 ? 'down' : 'stable',
          percentage: Math.abs(content.change || 0),
          period: 'vs. anterior'
        }
      },
      sort_index: 0, // Fixed: use sort_index instead of order
      visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return (
      <SnapshotCard 
        block={blockData}
        readonly={readonly}
      />
    );
  }

  // Block pattern
  if (block) {
    const blockData: ReviewBlock = {
      ...block,
      content: {
        title: block.content?.title,
        subtitle: block.content?.subtitle,
        value: block.content?.value,
        description: block.content?.description,
        color: block.content?.color,
        icon: block.content?.icon,
        trend: block.content?.trend ? {
          direction: block.content.trend.direction || 'stable',
          percentage: block.content.trend.percentage,
          period: block.content.trend.period
        } : undefined
      }
    };

    return (
      <SnapshotCard 
        block={blockData}
        onUpdate={onUpdate}
        readonly={readonly}
      />
    );
  }

  return (
    <div className="snapshot-card-error border-2 border-red-500 rounded-lg p-4 text-center">
      <p className="text-red-500">Erro: Nenhum dado fornecido para o cartão</p>
    </div>
  );
};
