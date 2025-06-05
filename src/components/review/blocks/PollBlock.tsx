// ABOUTME: Interactive poll block with real-time voting and inline editing
// Provides comprehensive poll creation and management with live results

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Vote,
  Users,
  TrendingUp
} from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
}

export const PollBlock: React.FC<PollBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate,
  onInteraction
}) => {
  const content = block.content;
  const question = content.question || '';
  
  // Handle both string[] and object[] formats for options
  const rawOptions = content.options || ['Opção 1', 'Opção 2'];
  const options: PollOption[] = rawOptions.map((option: any, index: number) => {
    if (typeof option === 'string') {
      return {
        id: `option-${index}`,
        text: option,
        votes: 0
      };
    } else if (typeof option === 'object' && option.text) {
      return {
        id: option.id || `option-${index}`,
        text: option.text,
        votes: option.votes || 0
      };
    } else {
      return {
        id: `option-${index}`,
        text: `Opção ${index + 1}`,
        votes: 0
      };
    }
  });
  
  const pollType = content.poll_type || 'single_choice';
  const votes = content.votes || new Array(options.length).fill(0);
  const totalVotes = content.total_votes || 0;
  const allowAddOptions = content.allow_add_options || false;
  
  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#3b82f6';
  
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text: value };
    handleUpdate('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...options, {
      id: `option-${options.length}`,
      text: `Opção ${options.length + 1}`,
      votes: 0
    }];
    const newVotes = [...votes, 0];
    handleUpdate('options', newOptions);
    handleUpdate('votes', newVotes);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Minimum 2 options
    
    const newOptions = options.filter((_, i) => i !== index);
    const newVotes = votes.filter((_, i) => i !== index);
    handleUpdate('options', newOptions);
    handleUpdate('votes', newVotes);
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;
    
    const newVotes = [...votes];
    selectedOptions.forEach(optionIndex => {
      newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
    });
    
    handleUpdate('votes', newVotes);
    handleUpdate('total_votes', totalVotes + 1);
    setHasVoted(true);
    
    // Trigger interaction event
    if (onInteraction) {
      onInteraction(String(block.id), 'poll_voted', {
        poll_id: block.id,
        selected_options: selectedOptions,
        poll_type: pollType
      });
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (hasVoted) return;
    
    if (pollType === 'single_choice') {
      setSelectedOptions([optionIndex]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionIndex)
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      );
    }
  };

  const getVotePercentage = (optionVotes: number) => {
    return totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  if (readonly) {
    return (
      <div className="poll-block my-6">
        <Card 
          className="border shadow-lg"
          style={cardStyle}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
              <BarChart3 className="w-5 h-5" style={{ color: accentColor }} />
              {question}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm" style={{ color: textColor, opacity: 0.7 }}>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalVotes} votos
              </div>
              <div className="flex items-center gap-1">
                <Vote className="w-4 h-4" />
                {pollType === 'single_choice' ? 'Escolha única' : 'Múltipla escolha'}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {options.map((option, index) => {
              const optionVotes = votes[index] || 0;
              const percentage = getVotePercentage(optionVotes);
              
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: textColor }}>{option.text}</span>
                    <span style={{ color: textColor, opacity: 0.7 }}>{percentage}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ backgroundColor: `${borderColor}` }}
                  />
                </div>
              );
            })}
          </CardContent>
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
        className="border shadow-lg"
        style={cardStyle}
      >
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: accentColor }} />
              <span className="font-semibold" style={{ color: textColor }}>
                Editor de Enquete
              </span>
            </div>
            
            {/* Question Editor */}
            <InlineTextEditor
              value={question}
              onChange={(value) => handleUpdate('question', value)}
              placeholder="Digite a pergunta da enquete..."
              className="text-lg font-semibold"
              style={{ color: textColor }}
            />
            
            {/* Poll Type Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm" style={{ color: textColor, opacity: 0.8 }}>
                Tipo:
              </label>
              <Select 
                value={pollType} 
                onValueChange={(value) => handleUpdate('poll_type', value)}
              >
                <SelectTrigger 
                  className="w-48"
                  style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="single_choice">Escolha única</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Options Editor */}
          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: textColor, opacity: 0.8 }}>
              Opções de resposta:
            </label>
            
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <InlineTextEditor
                    value={option.text}
                    onChange={(value) => handleOptionChange(index, value)}
                    placeholder={`Opção ${index + 1}`}
                    className="w-full"
                    style={{ color: textColor }}
                  />
                </div>
                
                {options.length > 2 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOption(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              size="sm"
              variant="outline"
              onClick={addOption}
              className="w-full"
              style={{ borderColor: borderColor, color: textColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Opção
            </Button>
          </div>
          
          {/* Results Preview */}
          {totalVotes > 0 && (
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: borderColor }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: textColor, opacity: 0.8 }}>
                  Resultados Atuais ({totalVotes} votos)
                </span>
              </div>
              
              {options.map((option, index) => {
                const optionVotes = votes[index] || 0;
                const percentage = getVotePercentage(optionVotes);
                
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: textColor }}>{option.text}</span>
                      <span style={{ color: textColor, opacity: 0.7 }}>
                        {optionVotes} votos ({percentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-1"
                      style={{ backgroundColor: borderColor }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
