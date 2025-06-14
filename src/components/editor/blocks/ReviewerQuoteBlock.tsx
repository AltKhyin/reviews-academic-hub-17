
// ABOUTME: Editor component for reviewer quote blocks.
// Allows input for quote text, author, and source of the quote.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ReviewerQuoteBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { quote?: string; author?: string; source?: string }; // source can be role, affiliation, etc.
  onUpdateContent: (newContent: { quote?: string; author?: string; source?: string }) => void;
}

export const ReviewerQuoteBlock: React.FC<ReviewerQuoteBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const { quote = '', author = '', source = '' } = content || {};

  const handleChange = (field: keyof ReviewerQuoteBlockProps['content'], value: string) => {
    onUpdateContent({ ...content, [field]: value });
  };

  if (readonly) {
    return (
      <blockquote className="my-2 p-3 border-l-4 border-purple-500 bg-purple-950/30 text-purple-300 rounded-r-md shadow">
        <p className="italic leading-relaxed text-gray-300">"{quote || "Citação não fornecida."}"</p>
        {(author || source) && (
          <footer className="mt-2 text-sm">
            {author && <cite className="font-semibold not-italic text-purple-400">{author}</cite>}
            {author && source && <span className="text-purple-500">, </span>}
            {source && <span className="text-purple-400/80">{source}</span>}
          </footer>
        )}
      </blockquote>
    );
  }

  return (
    <div className="p-3 space-y-3 border border-gray-700 rounded bg-gray-850">
      <div>
        <Label htmlFor={`rq-quote-${block.id}`} className="text-xs text-gray-400">Citação do Revisor</Label>
        <Textarea 
          id={`rq-quote-${block.id}`} 
          value={quote} 
          onChange={(e) => handleChange('quote', e.target.value)} 
          placeholder='Insira a citação textual aqui...'
          className="bg-gray-800 border-gray-600 text-white text-sm min-h-[80px]"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor={`rq-author-${block.id}`} className="text-xs text-gray-400">Autor/Revisor (Opcional)</Label>
        <Input 
          id={`rq-author-${block.id}`} 
          value={author} 
          onChange={(e) => handleChange('author', e.target.value)} 
          placeholder="Ex: Dr. João Silva"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
      <div>
        <Label htmlFor={`rq-source-${block.id}`} className="text-xs text-gray-400">Fonte/Afiliação (Opcional)</Label>
        <Input 
          id={`rq-source-${block.id}`} 
          value={source} 
          onChange={(e) => handleChange('source', e.target.value)} 
          placeholder="Ex: Revisor Chefe, Journal of Medicine"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
    </div>
  );
};

