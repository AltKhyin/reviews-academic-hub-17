
// ABOUTME: Editor component for number card blocks.
// Displays a prominent number, a label, and an optional description.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface NumberCardBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { number?: string | number; label?: string; description?: string };
  onUpdateContent: (newContent: { number?: string | number; label?: string; description?: string }) => void;
}

export const NumberCardBlock: React.FC<NumberCardBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const { number = '0', label = 'Rótulo', description = '' } = content || {};

  const handleChange = (field: keyof NumberCardBlockProps['content'], value: string) => {
    onUpdateContent({ ...content, [field]: value });
  };

  if (readonly) {
    return (
      <div className="p-4 my-2 bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900 rounded-lg shadow-xl text-center text-white">
        <div className="text-5xl font-bold tracking-tight">{String(number)}</div>
        <div className="text-md text-blue-200 mt-1">{label}</div>
        {description && <p className="text-xs text-blue-300/80 mt-2 px-2">{description}</p>}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 border border-gray-700 rounded bg-gray-850">
      <div>
        <Label htmlFor={`nc-number-${block.id}`} className="text-xs text-gray-400">Número/Valor</Label>
        <Input 
          id={`nc-number-${block.id}`} 
          value={String(number)} 
          onChange={(e) => handleChange('number', e.target.value)} 
          placeholder="100"
          className="bg-gray-800 border-gray-600 text-white text-sm font-semibold"
        />
      </div>
      <div>
        <Label htmlFor={`nc-label-${block.id}`} className="text-xs text-gray-400">Rótulo Principal</Label>
        <Input 
          id={`nc-label-${block.id}`} 
          value={label} 
          onChange={(e) => handleChange('label', e.target.value)} 
          placeholder="Ex: Pacientes Atendidos"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
      <div>
        <Label htmlFor={`nc-desc-${block.id}`} className="text-xs text-gray-400">Descrição (Opcional)</Label>
        <Input 
          id={`nc-desc-${block.id}`} 
          value={description} 
          onChange={(e) => handleChange('description', e.target.value)} 
          placeholder="Detalhes adicionais sobre o número"
          className="bg-gray-800 border-gray-600 text-white text-sm"
        />
      </div>
       <div className="mt-3 p-3 border border-dashed border-gray-600 rounded bg-gray-900/60 text-center">
        <p className="text-xs text-gray-500 mb-1">Pré-visualização:</p>
        <div className="text-3xl font-bold text-blue-400">{String(number)}</div>
        <div className="text-sm text-gray-300 mt-0.5">{label}</div>
        {description && <p className="text-xxs text-gray-400/80 mt-1">{description}</p>}
      </div>
    </div>
  );
};

