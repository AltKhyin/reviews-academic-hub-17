
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
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Vote,
  Users,
  TrendingUp
} from 'lucide-react';

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
  const payload = block.payload;
  const question = payload.question || '';
  const options = payload.options || ['Opção 1', 'Opção 2'];
  const pollType = payload.poll_type || 'single_choice';
  const votes = payload.votes || new Array(options.length).fill(0);
  const totalVotes = payload.total_votes || 0;
  const allowAddOptions = payload.allow_add_options || false;
  
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    handleUpdate('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...options, `Opção ${options.length + 1}`];
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

  if (readonly) {
    return (
      <div className="poll-block my-6">
        <Card 
          className="border shadow-lg"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
              <BarChart3 className="w-5 h-5" style={{ color: '#3b82f6' }} />
              {question}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm" style={{ color: '#9ca3af' }}>
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
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#ffffff' }}>{option}</span>
                    <span style={{ color: '#9ca3af' }}>{percentage}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ backgroundColor: '#2a2a2a' }}
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
    <div className="poll-block my-6">
      <Card 
        className="border shadow-lg"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: '#3b82f6' }} />
              <span className="font-semibold" style={{ color: '#ffffff' }}>
                Editor de Enquete
              </span>
            </div>
            
            {/* Question Editor */}
            <InlineTextEditor
              value={question}
              onChange={(value) => handleUpdate('question', value)}
              placeholder="Digite a pergunta da enquete..."
              className="text-lg font-semibold"
            />
            
            {/* Poll Type Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm" style={{ color: '#d1d5db' }}>
                Tipo:
              </label>
              <Select 
                value={pollType} 
                onValueChange={(value) => handleUpdate('poll_type', value)}
              >
                <SelectTrigger 
                  className="w-48"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
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
            <label className="text-sm font-medium" style={{ color: '#d1d5db' }}>
              Opções de resposta:
            </label>
            
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <InlineTextEditor
                    value={option}
                    onChange={(value) => handleOptionChange(index, value)}
                    placeholder={`Opção ${index + 1}`}
                    className="w-full"
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
              style={{ borderColor: '#2a2a2a' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Opção
            </Button>
          </div>
          
          {/* Results Preview */}
          {totalVotes > 0 && (
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#2a2a2a' }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>
                  Resultados Atuais ({totalVotes} votos)
                </span>
              </div>
              
              {options.map((option, index) => {
                const optionVotes = votes[index] || 0;
                const percentage = getVotePercentage(optionVotes);
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: '#ffffff' }}>{option}</span>
                      <span style={{ color: '#9ca3af' }}>
                        {optionVotes} votos ({percentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-1"
                      style={{ backgroundColor: '#2a2a2a' }}
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
