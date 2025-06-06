
// ABOUTME: Interactive poll block for reader engagement and feedback collection
// Supports single/multiple choice polls with real-time voting

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Vote, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  onVote?: (optionId: string) => void;
}

export const PollBlock: React.FC<PollBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate,
  onVote
}) => {
  // Safe access to content with comprehensive fallbacks
  const content = block.content || {};
  const question = content.question || 'Nova enquete';
  const options: PollOption[] = Array.isArray(content.options) ? content.options : [];
  const pollType = content.poll_type || 'single_choice'; // single_choice, multiple_choice
  const allowAddOptions = content.allow_add_options ?? false;
  const showResults = content.show_results ?? true;
  const isActive = content.is_active ?? true;
  const totalVotes = content.total_votes || 0;

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#3b82f6';
  const resultBarColor = content.result_bar_color || '#3b82f6';

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const addOption = () => {
    const newOption: PollOption = {
      id: `option_${Date.now()}`,
      text: 'Nova opção',
      votes: 0
    };
    
    handleUpdate('options', [...options, newOption]);
  };

  const updateOption = (optionId: string, text: string) => {
    const updatedOptions = options.map(option =>
      option.id === optionId ? { ...option, text } : option
    );
    handleUpdate('options', updatedOptions);
  };

  const removeOption = (optionId: string) => {
    const updatedOptions = options.filter(option => option.id !== optionId);
    handleUpdate('options', updatedOptions);
  };

  const handleOptionSelect = (optionId: string) => {
    if (pollType === 'single_choice') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const submitVote = () => {
    if (selectedOptions.length > 0 && onVote) {
      selectedOptions.forEach(optionId => onVote(optionId));
      setHasVoted(true);
    }
  };

  const getVotePercentage = (votes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  if (readonly) {
    return (
      <div className="poll-block my-6">
        <Card 
          className="p-6"
          style={{ 
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            color: textColor
          }}
        >
          {/* Poll Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                {question}
              </h3>
              <div className="flex items-center gap-2 text-sm" style={{ color: textColor, opacity: 0.7 }}>
                <Users className="w-4 h-4" />
                <span>{totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}</span>
                <Badge 
                  variant="outline"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {pollType === 'single_choice' ? 'Escolha única' : 'Múltipla escolha'}
                </Badge>
                {!isActive && (
                  <Badge variant="secondary">
                    Encerrada
                  </Badge>
                )}
              </div>
            </div>
            <Vote className="w-5 h-5" style={{ color: accentColor }} />
          </div>

          {/* Poll Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const percentage = getVotePercentage(option.votes);
              const isSelected = selectedOptions.includes(option.id);
              
              return (
                <div key={option.id} className="poll-option">
                  {(!hasVoted && isActive) ? (
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full text-left justify-start h-auto p-4",
                        isSelected && "ring-2"
                      )}
                      style={{ 
                        borderColor: isSelected ? accentColor : borderColor,
                        color: textColor,
                        backgroundColor: isSelected ? `${accentColor}20` : 'transparent'
                      }}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div 
                          className={cn(
                            "w-4 h-4 border-2 rounded",
                            pollType === 'single_choice' ? 'rounded-full' : 'rounded-sm'
                          )}
                          style={{ 
                            borderColor: accentColor,
                            backgroundColor: isSelected ? accentColor : 'transparent'
                          }}
                        />
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </Button>
                  ) : (
                    <div 
                      className="relative p-4 rounded border"
                      style={{ borderColor: borderColor }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: textColor }}>{option.text}</span>
                        <span className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
                          {option.votes} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      {showResults && (
                        <Progress 
                          value={percentage} 
                          className="h-2"
                          style={{ backgroundColor: `${resultBarColor}30` }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {!hasVoted && isActive && selectedOptions.length > 0 && (
            <div className="mt-4 text-center">
              <Button 
                onClick={submitVote}
                style={{ backgroundColor: accentColor, color: '#ffffff' }}
              >
                Votar ({selectedOptions.length} {pollType === 'single_choice' ? 'opção' : 'opções'})
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="mt-4 text-center">
              <Badge 
                variant="outline"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Obrigado pelo seu voto!
              </Badge>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="poll-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <Card 
        className="p-6"
        style={{ 
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          color: textColor
        }}
      >
        {/* Question Editor */}
        <div className="mb-4">
          <InlineTextEditor
            value={question}
            onChange={(value) => handleUpdate('question', value)}
            className="text-lg font-semibold"
            style={{ color: textColor }}
            placeholder="Digite a pergunta da enquete..."
          />
        </div>

        {/* Poll Settings */}
        <div className="flex flex-wrap gap-4 mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={pollType === 'single_choice'}
              onChange={() => handleUpdate('poll_type', 'single_choice')}
              style={{ accentColor: accentColor }}
            />
            <span className="text-sm" style={{ color: textColor }}>Escolha única</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={pollType === 'multiple_choice'}
              onChange={() => handleUpdate('poll_type', 'multiple_choice')}
              style={{ accentColor: accentColor }}
            />
            <span className="text-sm" style={{ color: textColor }}>Múltipla escolha</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => handleUpdate('is_active', e.target.checked)}
              style={{ accentColor: accentColor }}
            />
            <span className="text-sm" style={{ color: textColor }}>Ativa</span>
          </label>
        </div>

        {/* Options Editor */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <div 
              key={option.id}
              className="flex items-center gap-3 p-3 rounded border group/option"
              style={{ borderColor: borderColor }}
            >
              <span className="text-sm font-medium" style={{ color: textColor, opacity: 0.7 }}>
                {index + 1}.
              </span>
              <InlineTextEditor
                value={option.text}
                onChange={(value) => updateOption(option.id, value)}
                className="flex-1"
                style={{ color: textColor }}
                placeholder="Texto da opção..."
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOption(option.id)}
                className="opacity-0 group-hover/option:opacity-100 text-red-400"
                disabled={options.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={addOption}
            className="flex items-center gap-2"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <Plus className="w-4 h-4" />
            Adicionar Opção
          </Button>
        </div>
      </Card>
    </div>
  );
};
