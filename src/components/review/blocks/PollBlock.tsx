
// ABOUTME: Refactored poll block with extracted components for better maintainability
// Main poll container using focused sub-components

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { PollConfig } from './poll/PollConfig';
import { PollVoting } from './poll/PollVoting';
import { PollResults } from './poll/PollResults';
import { 
  BarChart3, 
  Vote,
  Users,
  TrendingUp,
  Clock,
  Circle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  color?: string;
}

interface PollBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
}

const pollTypes = {
  single_choice: { label: 'Escolha Única', icon: Circle, description: 'Uma opção por voto' },
  multiple_choice: { label: 'Múltipla Escolha', icon: Circle, description: 'Várias opções por voto' },
  rating: { label: 'Avaliação', icon: TrendingUp, description: 'Escala de 1-5' },
  ranking: { label: 'Ranking', icon: BarChart3, description: 'Ordenar por preferência' }
};

const pollStatuses = {
  draft: { label: 'Rascunho', color: '#6b7280' },
  active: { label: 'Ativo', color: '#10b981' },
  closed: { label: 'Encerrado', color: '#ef4444' },
  scheduled: { label: 'Agendado', color: '#f59e0b' }
};

export const PollBlock: React.FC<PollBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate,
  onInteraction
}) => {
  const content = block.content;
  const question = content.question || '';
  const description = content.description || '';
  
  // Handle both string[] and object[] formats for options
  const rawOptions = content.options || ['Opção 1', 'Opção 2'];
  const options: PollOption[] = rawOptions.map((option: any, index: number) => {
    if (typeof option === 'string') {
      return {
        id: `option-${index}`,
        text: option,
        votes: 0,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      };
    } else if (typeof option === 'object' && option.text) {
      return {
        id: option.id || `option-${index}`,
        text: option.text,
        votes: option.votes || 0,
        color: option.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      };
    } else {
      return {
        id: `option-${index}`,
        text: `Opção ${index + 1}`,
        votes: 0,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      };
    }
  });
  
  const pollType = content.poll_type || 'single_choice';
  const votes = content.votes || new Array(options.length).fill(0);
  const totalVotes = content.total_votes || 0;
  const showResults = content.show_results ?? true;
  const pollStatus = content.poll_status || 'draft';
  const resultDisplay = content.result_display || 'bar';
  const showVoteCount = content.show_vote_count ?? true;
  const showPercentage = content.show_percentage ?? true;
  const anonymousVoting = content.anonymous_voting ?? true;
  const deadline = content.deadline || '';
  const maxSelections = content.max_selections || 1;
  const minSelections = content.min_selections || 1;
  
  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#3b82f6';
  const questionColor = content.question_color || textColor;
  
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfig, setShowConfig] = useState(!readonly);

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

  const handleOptionChange = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleUpdate('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...options, {
      id: `option-${options.length}`,
      text: `Opção ${options.length + 1}`,
      votes: 0,
      color: `hsl(${(options.length * 137.5) % 360}, 70%, 50%)`
    }];
    const newVotes = [...votes, 0];
    handleUpdate('options', newOptions);
    handleUpdate('votes', newVotes);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    
    const newOptions = options.filter((_, i) => i !== index);
    const newVotes = votes.filter((_, i) => i !== index);
    handleUpdate('options', newOptions);
    handleUpdate('votes', newVotes);
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;
    if (selectedOptions.length < minSelections || selectedOptions.length > maxSelections) return;
    
    const newVotes = [...votes];
    selectedOptions.forEach(optionIndex => {
      newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
    });
    
    handleUpdate('votes', newVotes);
    handleUpdate('total_votes', totalVotes + 1);
    setHasVoted(true);
    
    if (onInteraction) {
      onInteraction(String(block.id), 'poll_voted', {
        poll_id: block.id,
        selected_options: selectedOptions,
        poll_type: pollType,
        question: question
      });
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (hasVoted || pollStatus !== 'active') return;
    
    if (pollType === 'single_choice') {
      setSelectedOptions([optionIndex]);
    } else {
      setSelectedOptions(prev => {
        if (prev.includes(optionIndex)) {
          return prev.filter(i => i !== optionIndex);
        } else if (prev.length < maxSelections) {
          return [...prev, optionIndex];
        }
        return prev;
      });
    }
  };

  const isPollActive = () => {
    if (pollStatus !== 'active') return false;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      return new Date() < deadlineDate;
    }
    return true;
  };

  const canVote = () => {
    return isPollActive() && !hasVoted && selectedOptions.length >= minSelections && selectedOptions.length <= maxSelections;
  };

  const PollTypeIcon = pollTypes[pollType]?.icon || Circle;
  const statusConfig = pollStatuses[pollStatus];

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  if (readonly) {
    return (
      <div className="poll-block my-6">
        <Card className="border shadow-lg" style={cardStyle}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ color: questionColor }}>
                <PollTypeIcon className="w-5 h-5" style={{ color: accentColor }} />
                {question}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <div 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${statusConfig.color}20`,
                    color: statusConfig.color
                  }}
                >
                  {statusConfig.label}
                </div>
              </div>
            </div>
            
            {description && (
              <p className="text-sm mt-2" style={{ color: textColor, opacity: 0.8 }}>
                {description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm" style={{ color: textColor, opacity: 0.7 }}>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalVotes} votos
              </div>
              <div className="flex items-center gap-1">
                <Vote className="w-4 h-4" />
                {pollTypes[pollType]?.label}
              </div>
              {deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(deadline).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <PollVoting
              options={options}
              pollType={pollType}
              selectedOptions={selectedOptions}
              minSelections={minSelections}
              maxSelections={maxSelections}
              isPollActive={isPollActive()}
              hasVoted={hasVoted}
              canVote={canVote()}
              textColor={textColor}
              borderColor={borderColor}
              accentColor={accentColor}
              onOptionSelect={handleOptionSelect}
              onVote={handleVote}
            />
            
            <PollResults
              options={options}
              votes={votes}
              totalVotes={totalVotes}
              showResults={showResults}
              hasVoted={hasVoted}
              showVoteCount={showVoteCount}
              showPercentage={showPercentage}
              resultDisplay={resultDisplay}
              textColor={textColor}
              borderColor={borderColor}
            />
            
            {hasVoted && (
              <div className="text-center text-sm" style={{ color: accentColor }}>
                ✓ Seu voto foi registrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="poll-block my-6 group relative">
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <Card className="border shadow-lg" style={cardStyle}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PollTypeIcon className="w-5 h-5" style={{ color: accentColor }} />
              <span className="font-semibold text-sm" style={{ color: textColor }}>
                Editor de Enquete
              </span>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              {showConfig ? 'Ocultar' : 'Configurar'}
            </Button>
          </div>
          
          <InlineTextEditor
            value={question}
            onChange={(value) => handleUpdate('question', value)}
            placeholder="Digite a pergunta da enquete..."
            className="text-lg font-semibold"
            style={{ color: questionColor }}
          />
          
          <InlineRichTextEditor
            value={description}
            onChange={(value) => handleUpdate('description', value)}
            placeholder="Descrição da enquete (opcional)..."
            className="text-sm"
            style={{ color: textColor, opacity: 0.8 }}
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showConfig && (
            <PollConfig
              pollType={pollType}
              pollStatus={pollStatus}
              resultDisplay={resultDisplay}
              minSelections={minSelections}
              maxSelections={maxSelections}
              deadline={deadline}
              showResults={showResults}
              showVoteCount={showVoteCount}
              showPercentage={showPercentage}
              anonymousVoting={anonymousVoting}
              options={options}
              textColor={textColor}
              borderColor={borderColor}
              onUpdate={handleUpdate}
              onOptionChange={handleOptionChange}
              onAddOption={addOption}
              onRemoveOption={removeOption}
            />
          )}
          
          {totalVotes > 0 && (
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: borderColor }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  Preview dos Resultados ({totalVotes} votos)
                </span>
              </div>
              
              <PollResults
                options={options}
                votes={votes}
                totalVotes={totalVotes}
                showResults={true}
                hasVoted={true}
                showVoteCount={showVoteCount}
                showPercentage={showPercentage}
                resultDisplay={resultDisplay}
                textColor={textColor}
                borderColor={borderColor}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
