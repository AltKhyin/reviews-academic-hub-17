
// ABOUTME: Comment section header with consistent color system
// Displays comment count and loading state using app colors

import React from 'react';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface CommentSectionHeaderProps {
  commentCount: number;
  isLoading: boolean;
}

export const CommentSectionHeader: React.FC<CommentSectionHeaderProps> = ({ 
  commentCount, 
  isLoading 
}) => {
  return (
    <h3 className="text-lg font-medium mb-2 flex items-center" style={{ color: CSS_VARIABLES.TEXT_PRIMARY }}>
      Comentários
      {!isLoading && (
        <span className="ml-2 text-sm" style={{ color: CSS_VARIABLES.TEXT_MUTED }}>
          ({commentCount})
        </span>
      )}
    </h3>
  );
};
