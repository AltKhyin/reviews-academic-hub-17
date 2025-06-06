
import React from 'react';

interface CommentContentProps {
  content: string;
  className?: string;
}

export const CommentContent: React.FC<CommentContentProps> = ({ content, className = '' }) => {
  // Check if content contains HTML tags (rich text)
  const isRichText = /<[^>]*>/g.test(content);
  
  if (isRichText) {
    return (
      <div 
        className={`prose prose-sm max-w-none text-gray-200 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          // Override prose styles for dark theme
          color: '#e5e7eb'
        }}
      />
    );
  }
  
  // For plain text, render normally with line breaks
  return (
    <div className={`whitespace-pre-wrap text-gray-200 ${className}`}>
      {content}
    </div>
  );
};
