
// ABOUTME: Editor component for heading blocks.
// Allows editing heading text and level (H1-H6).
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { ContentEditable } from '@/components/editor/common/ContentEditable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface HeadingBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { text?: string; content?: string; level?: 1 | 2 | 3 | 4 | 5 | 6 };
  onUpdateContent: (newContent: { text: string; level?: 1 | 2 | 3 | 4 | 5 | 6 }) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const currentText = content?.text || content?.content || '';
  const level = content?.level || 2;

  const handleChange = (newText: string) => { // Directly receives the new HTML string
    onUpdateContent({ text: newText, level });
  };

  const handleLevelChange = (newLevel: string) => {
    onUpdateContent({ text: currentText, level: parseInt(newLevel, 10) as HeadingBlockProps['content']['level'] });
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  if (readonly) {
    return <Tag dangerouslySetInnerHTML={{ __html: currentText }} className={`font-bold prose prose-sm dark:prose-invert max-w-none py-1`} />;
  }

  return (
    <div className="space-y-2">
       <ContentEditable
        html={currentText}
        onChange={handleChange} // Pass handleChange directly
        tagName={Tag}
        className="p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-bold min-h-[24px] prose prose-sm dark:prose-invert max-w-none w-full"
        placeholder="Digite o título..."
        style={{ fontSize: `${2.25 - (level * 0.25)}rem` }}
        disabled={readonly}
      />
      <div className="mt-1">
        <Label htmlFor={`heading-level-${block.id}`} className="text-xs text-gray-400">Nível</Label>
        <Select value={String(level)} onValueChange={handleLevelChange} disabled={readonly}>
          <SelectTrigger id={`heading-level-${block.id}`} className="w-[80px] h-8 text-xs bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600 text-white">
            {[1, 2, 3, 4, 5, 6].map(l => (
              <SelectItem key={l} value={String(l)} className="text-xs">{`H${l}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
