
// ABOUTME: Editor component for text/paragraph blocks.
// Uses ContentEditable for rich text-like editing experience.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { ContentEditable } from '@/components/editor/common/ContentEditable'; 

export interface TextBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { text?: string; content?: string }; 
  onUpdateContent: (newContent: { text: string }) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, onUpdateContent, readonly }) => {
  const currentText = content?.text ?? content?.content ?? '';

  const handleChange = (newText: string) => { // Directly receives the new HTML string
    onUpdateContent({ text: newText });
  };

  if (readonly) {
    return <div dangerouslySetInnerHTML={{ __html: currentText || '<p></p>' }} className="prose prose-sm dark:prose-invert max-w-none py-1" />;
  }

  return (
    <ContentEditable
      html={currentText}
      onChange={handleChange} // Pass handleChange directly
      className="p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded min-h-[24px] prose prose-sm dark:prose-invert max-w-none w-full"
      placeholder="Digite o texto aqui..."
      disabled={readonly}
    />
  );
};
