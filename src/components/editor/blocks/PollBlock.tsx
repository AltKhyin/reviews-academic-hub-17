
// ABOUTME: Editor component for poll blocks.
// Allows creating questions with multiple choice options.
import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

export interface PollOptionEditor { // Renamed to avoid conflict with PollOption in review/blocks
  id: string;
  text: string;
  // votes are handled by the backend or display component, not part of this basic editor's content model
}

export interface PollBlockProps {
  block: ReviewBlock;
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  content: { question?: string; options?: PollOptionEditor[] };
  onUpdateContent: (newContent: { question?: string; options?: PollOptionEditor[] }) => void;
}

export const PollBlock: React.FC<PollBlockProps> = ({ block, content, onUpdateContent, readonly }) => {
  const { question = '', options = [{id: 'opt1', text: ''}] } = content || {};

  const handleQuestionChange = (newQuestion: string) => {
    onUpdateContent({ ...content, question: newQuestion });
  };

  const handleOptionChange = (index: number, newText: string) => {
    const newOptions = [...(options || [])];
    newOptions[index] = { ...newOptions[index], text: newText };
    onUpdateContent({ ...content, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(options || []), { id: `opt-${Date.now()}`, text: '' }];
    onUpdateContent({ ...content, options: newOptions });
  };

  const removeOption = (index: number) => {
    if ((options || []).length <= 1) return; // Keep at least one option
    const newOptions = (options || []).filter((_, i) => i !== index);
    onUpdateContent({ ...content, options: newOptions });
  };

  if (readonly) {
    return (
      <div className="my-2 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow">
        <h4 className="font-semibold text-md text-white mb-3">{question || "Enquete não configurada"}</h4>
        {options && options.length > 0 && options[0].text ? (
          <ul className="space-y-2">
            {options.map((opt) => (
              <li key={opt.id} className="p-2 border border-gray-600 rounded bg-gray-700/50 text-sm text-gray-300">
                {opt.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 italic">Nenhuma opção de enquete fornecida.</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 border border-gray-700 rounded bg-gray-850">
      <div>
        <Label htmlFor={`poll-question-${block.id}`} className="text-xs text-gray-400">Pergunta da Enquete</Label>
        <Textarea
          id={`poll-question-${block.id}`}
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Qual sua opinião sobre...?"
          className="bg-gray-800 border-gray-600 text-white text-sm min-h-[60px]"
          rows={2}
        />
      </div>
      <div>
        <Label className="text-xs text-gray-400 mb-1 block">Opções da Enquete</Label>
        {options && options.map((opt, index) => (
          <div key={opt.id || index} className="flex items-center gap-2 mb-2">
            <Input
              value={opt.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="bg-gray-800 border-gray-600 text-white text-sm flex-grow"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
              disabled={options.length <= 1}
              className="text-red-500 hover:text-red-400 disabled:text-gray-600"
              aria-label="Remover opção"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addOption}
          className="mt-1 text-blue-400 border-blue-500 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <PlusCircle size={14} className="mr-2" />
          Adicionar Opção
        </Button>
      </div>
    </div>
  );
};

