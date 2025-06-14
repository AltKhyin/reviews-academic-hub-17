
// ABOUTME: Editor component for citation list blocks.
// Allows managing a list of citations, each with its own text.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Simplified CitationItem for editor block, actual display might be richer
export interface EditorCitationItem { 
  id: string;
  text: string; // Full citation text for this basic editor block
}

export interface CitationListBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { items?: EditorCitationItem[] }; // Using EditorCitationItem for clarity in this context
  onUpdateContent: (newContent: { items?: EditorCitationItem[] }) => void;
}

export const CitationListBlock: React.FC<CitationListBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  // Storing citations as a single string, each on a new line for simplicity in THIS basic editor.
  // The actual 'CitationListBlock' in 'review/blocks' handles structured Citation objects.
  const citationsText = content?.items?.map(item => item.text).join('\n') || '';

  const handleChange = (fullText: string) => {
    const newItems: EditorCitationItem[] = fullText.split('\n').map((text, index) => ({
      // Attempt to preserve existing IDs if possible, or generate new ones.
      // This ID management is simplified for this basic editor block.
      id: content?.items?.[index]?.id || `editor-cit-${Date.now()}-${index}`,
      text
    }));
    onUpdateContent({ items: newItems });
  };

  if (readonly) {
    return (
      <div className="my-2 prose prose-sm dark:prose-invert max-w-none">
        <h4 className="font-semibold text-gray-300">Referências</h4>
        {content?.items && content.items.length > 0 ? (
          <ol className="list-decimal list-inside pl-0 space-y-1 text-gray-400">
            {content.items.map((item) => (
              <li key={item.id} className="text-xs leading-relaxed">{item.text}</li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-gray-500 italic">Nenhuma citação fornecida.</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 border border-gray-700 rounded bg-gray-850">
      <Label htmlFor={`citations-editor-${block.id}`} className="text-xs text-gray-400 mb-1 block">
        Lista de Citações (uma por linha - editor simplificado)
      </Label>
      <Textarea 
        id={`citations-editor-${block.id}`} 
        value={citationsText} 
        onChange={(e) => handleChange(e.target.value)} 
        placeholder={"1. Autor A. Título do Artigo. Journal. Ano;Vol(Issue):Pages.\n2. Autor B. Outro Título. Conference. Ano."}
        className="bg-gray-800 border-gray-600 text-white text-xs min-h-[100px] leading-relaxed"
        rows={5}
      />
      <p className="text-xxs text-gray-500 mt-1">
        Nota: Este é um editor simplificado. A exibição final usará formatação estruturada.
      </p>
    </div>
  );
};

