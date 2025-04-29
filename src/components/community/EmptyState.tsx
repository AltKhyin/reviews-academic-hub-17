
import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="text-center py-12 text-gray-400">
      <p>{message}</p>
    </div>
  );
};
