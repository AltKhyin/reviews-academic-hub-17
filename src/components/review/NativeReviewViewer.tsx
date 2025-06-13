
// ABOUTME: Native review viewer component for displaying review content
// Fixed to use proper type imports and handle enhanced issue data without circular dependencies

import React from 'react';
import { Issue } from '@/types/review';
import { BlockRenderer } from './BlockRenderer';

// Local interface to avoid circular dependencies
interface EnhancedIssueLocal extends Issue {
  content_blocks?: any[];
  table_of_contents?: any;
  interaction_data?: {
    is_bookmarked?: boolean;
    user_reaction?: string | null;
    view_count?: number;
  };
}

interface NativeReviewViewerProps {
  issue: EnhancedIssueLocal;
  onBlockInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  className?: string;
}

export const NativeReviewViewer: React.FC<NativeReviewViewerProps> = ({
  issue,
  onBlockInteraction,
  onSectionView,
  className
}) => {
  const blocks = issue.content_blocks || issue.review_content || [];

  if (!blocks || blocks.length === 0) {
    return (
      <div className="native-review-viewer-empty text-center py-12">
        <div className="text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Conteúdo não disponível</h3>
          <p className="text-sm">Este artigo não possui conteúdo nativo ou está sendo carregado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`native-review-viewer space-y-6 ${className || ''}`}>
      {blocks.map((block: any) => (
        <BlockRenderer
          key={block.id}
          block={block}
          readonly={true}
          onInteraction={onBlockInteraction}
          onSectionView={onSectionView}
        />
      ))}
    </div>
  );
};
