
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface CommentContentProps {
  fullName: string | null;
  content: string;
  createdAt: string;
}

export const CommentContent: React.FC<CommentContentProps> = ({
  fullName,
  content,
  createdAt
}) => {
  return (
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-sm">
          {fullName || "Anonymous User"}
        </span>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
      <div className="mt-1 text-sm">
        {content}
      </div>
    </div>
  );
};
