
// ABOUTME: Editor component for callout blocks (info, warning, etc.).
// Allows configuring callout type, title, and content.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming shadcn/ui

export interface CalloutBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { type?: 'info' | 'warning' | 'success' | 'error'; title?: string; text?: string };
  onUpdateContent: (newContent: { type?: 'info' | 'warning' | 'success' | 'error'; title?: string; text?: string }) => void;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const { type = 'info', title = '', text = '' } = content || {};

  const handleChange = (field: keyof CalloutBlockProps['content'], value: string) => {
    onUpdateContent({ ...content, [field]: value });
  };

  if (readonly) {
    // Basic readonly display, can be enhanced with icons and colors based on type
    return (
      <div className={`my-2 p-3 border-l-4 ${type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' : type === 'error' ? 'border-red-500 bg-red-500/10' : type === 'success' ? 'border-green-500 bg-green-500/10' : 'border-blue-500 bg-blue-500/10'} rounded-r-md`}>
        {title && <h5 className="font-semibold mb-1 text-white">{title}</h5>}
        <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{__html: text || ''}}></p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 border border-gray-700 rounded bg-gray-850">
      <div>
        <Label htmlFor={`callout-type-${block.id}`} className="text-xs text-gray-400">Tipo</Label>
        <Select value={type} onValueChange={(value) => handleChange('type', value as CalloutBlockProps['content']['type'])}>
          <SelectTrigger id={`callout-type-${block.id}`} className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600 text-white">
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Atenção</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`callout-title-${block.id}`} className="text-xs text-gray-400">Título (Opcional)</Label>
        <Input
          id={`callout-title-${block.id}`}
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Título do Callout"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
      <div>
        <Label htmlFor={`callout-text-${block.id}`} className="text-xs text-gray-400">Texto do Callout</Label>
        <Textarea
          id={`callout-text-${block.id}`}
          value={text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Conteúdo do callout..."
          className="bg-gray-800 border-gray-600 text-white text-sm min-h-[80px]"
          rows={3}
        />
      </div>
    </div>
  );
};

