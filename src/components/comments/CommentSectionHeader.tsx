
import React from 'react';

interface CommentSectionHeaderProps {
  commentCount: number;
  isLoading: boolean;
}

export const CommentSectionHeader: React.FC<CommentSectionHeaderProps> = ({ 
  commentCount, 
  isLoading 
}) => {
  return (
    <h3 className="text-lg font-medium mb-2 flex items-center">
      Comentários
      {!isLoading && (
        <span className="ml-2 text-sm text-gray-400">
          ({commentCount})
        </span>
      )}
    </h3>
  );
};
