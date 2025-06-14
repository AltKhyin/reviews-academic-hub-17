
// ABOUTME: Editor component for table blocks.
// Provides a basic way to define table content, potentially as HTML or structured data.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Textarea } from '@/components/ui/textarea'; // Assuming basic HTML editing for now
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// This editor block is simplified. The actual 'TableBlock' in 'review/blocks' 
// handles rich table editing (rows, cols, cells). This one might just take HTML for now.
export interface TableBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { title?: string; html?: string }; // Simplified: assumes HTML content for table
  onUpdateContent: (newContent: { title?: string; html?: string }) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const { title = 'Tabela', html = '<table>\n  <thead>\n    <tr>\n      <th>Cabeçalho 1</th>\n      <th>Cabeçalho 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Dado 1A</td>\n      <td>Dado 1B</td>\n    </tr>\n    <tr>\n      <td>Dado 2A</td>\n      <td>Dado 2B</td>\n    </tr>\n  </tbody>\n</table>' } = content || {};

  const handleContentChange = (field: keyof TableBlockProps['content'], value: string) => {
    onUpdateContent({ ...content, [field]: value });
  };

  if (readonly) {
    return (
      <div className="my-2">
        {title && <h4 className="font-semibold text-center mb-2 text-white text-lg">{title}</h4>}
        <div 
          className="overflow-x-auto prose prose-sm dark:prose-invert max-w-none p-1 bg-gray-800/30 rounded border border-gray-700" 
          dangerouslySetInnerHTML={{ __html: html || '<p class="text-xs text-gray-500 italic">Tabela vazia.</p>' }} 
        />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 border border-gray-700 rounded bg-gray-850">
      <div>
        <Label htmlFor={`table-title-${block.id}`} className="text-xs text-gray-400">Título da Tabela (Opcional)</Label>
        <Input 
          id={`table-title-${block.id}`} 
          value={title} 
          onChange={(e) => handleContentChange('title', e.target.value)} 
          placeholder="Título da Tabela"
          className="w-full p-1.5 bg-gray-800 border-gray-600 rounded text-white placeholder-gray-500 text-sm"
        />
      </div>
      <div>
        <Label htmlFor={`table-html-${block.id}`} className="text-xs text-gray-400">Conteúdo da Tabela (HTML)</Label>
        <Textarea 
          id={`table-html-${block.id}`} 
          value={html} 
          onChange={(e) => handleContentChange('html', e.target.value)} 
          placeholder="Cole ou edite o HTML da sua tabela aqui..."
          className="bg-gray-800 border-gray-600 text-white text-xs min-h-[150px] leading-relaxed font-mono"
          rows={8}
        />
        <p className="text-xxs text-gray-500 mt-1">
          Nota: Para tabelas complexas, a edição HTML direta é usada. A exibição final será estilizada.
        </p>
      </div>
      
      <details className="mt-2 text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-300">Pré-visualização da Tabela</summary>
          <div className="mt-1 overflow-x-auto prose prose-sm dark:prose-invert max-w-none border border-dashed border-gray-600 p-2 rounded bg-gray-900/50">
             {title && <h4 className="font-semibold text-center mb-1 text-white text-sm">{title}</h4>}
             <div dangerouslySetInnerHTML={{ __html: html || '<p class="text-xs text-gray-500 italic">Sem conteúdo para pré-visualizar.</p>' }} />
          </div>
      </details>
    </div>
  );
};

