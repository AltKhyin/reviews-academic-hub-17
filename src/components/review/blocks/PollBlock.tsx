
// ABOUTME: Enhanced interactive poll block with comprehensive voting system and analytics
// Provides complete poll creation, management, and real-time results with advanced options

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Vote,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Circle,
  Square,
  CheckSquare,
  Calendar,
  Eye,
  EyeOff,
  Settings,
  PieChart
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
  multiple_choice: { label: 'Múltipla Escolha', icon: Square, description: 'Várias opções por voto' },
  rating: { label: 'Avaliação', icon: TrendingUp, description: 'Escala de 1-5' },
  ranking: { label: 'Ranking', icon: BarChart3, description: 'Ordenar por preferência' }
};

const resultDisplayTypes = {
  bar: 'Barras',
  pie: 'Pizza', 
  list: 'Lista',
  minimal: 'Minimal'
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
  const allowAddOptions = content.allow_add_options || false;
  const showResults = content.show_results ?? true;
  const anonymousVoting = content.anonymous_voting ?? true;
  const requireAuth = content.require_auth ?? false;
  const deadline = content.deadline || '';
  const maxSelections = content.max_selections || 1;
  const minSelections = content.min_selections || 1;
  const pollStatus = content.poll_status || 'draft';
  const resultDisplay = content.result_display || 'bar';
  const showVoteCount = content.show_vote_count ?? true;
  const showPercentage = content.show_percentage ?? true;
  const allowComments = content.allow_comments ?? false;
  
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
    if (options.length <= 2) return; // Minimum 2 options
    
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
    
    // Trigger interaction event
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

  const getVotePercentage = (optionVotes: number) => {
    return totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
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

  const renderResults = () => {
    if (!showResults && !hasVoted) return null;

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionVotes = votes[index] || 0;
          const percentage = getVotePercentage(optionVotes);
          
          if (resultDisplay === 'minimal') {
            return (
              <div key={option.id} className="flex items-center justify-between text-sm">
                <span style={{ color: textColor }}>{option.text}</span>
                <div className="flex items-center gap-2">
                  {showVoteCount && (
                    <span style={{ color: textColor, opacity: 0.7 }}>{optionVotes}</span>
                  )}
                  {showPercentage && (
                    <span style={{ color: textColor, opacity: 0.7 }}>{percentage}%</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: textColor }}>{option.text}</span>
                <div className="flex items-center gap-2 text-sm">
                  {showVoteCount && (
                    <span style={{ color: textColor, opacity: 0.7 }}>{optionVotes} votos</span>
                  )}
                  {showPercentage && (
                    <span style={{ color: textColor, opacity: 0.7 }}>{percentage}%</span>
                  )}
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{ 
                  backgroundColor: borderColor,
                  ['--progress-background' as any]: option.color
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderVotingInterface = () => {
    if (hasVoted || !isPollActive()) return null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOptions.includes(index);
            const SelectIcon = pollType === 'single_choice' ? 
              (isSelected ? CheckCircle : Circle) :
              (isSelected ? CheckSquare : Square);

            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleOptionSelect(index)}
                style={{
                  backgroundColor: isSelected ? accentColor : 'transparent',
                  borderColor: isSelected ? accentColor : borderColor,
                  color: isSelected ? '#ffffff' : textColor
                }}
              >
                <SelectIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="flex-1">{option.text}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: textColor, opacity: 0.7 }}>
            {pollType === 'multiple_choice' && maxSelections > 1 && (
              <span>
                Selecione {minSelections === maxSelections ? maxSelections : `${minSelections}-${maxSelections}`} opção(ões)
              </span>
            )}
          </div>
          
          <Button
            onClick={handleVote}
            disabled={!canVote()}
            className="flex items-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            <Vote className="w-4 h-4" />
            Votar
          </Button>
        </div>
      </div>
    );
  };

  if (readonly) {
    return (
      <div className="poll-block my-6">
        <Card 
          className="border shadow-lg"
          style={cardStyle}
        >
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
            {renderVotingInterface()}
            {renderResults()}
            
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
          
          {/* Question Editor */}
          <InlineTextEditor
            value={question}
            onChange={(value) => handleUpdate('question', value)}
            placeholder="Digite a pergunta da enquete..."
            className="text-lg font-semibold"
            style={{ color: questionColor }}
          />
          
          {/* Description Editor */}
          <InlineRichTextEditor
            value={description}
            onChange={(value) => handleUpdate('description', value)}
            placeholder="Descrição da enquete (opcional)..."
            className="text-sm"
            style={{ color: textColor, opacity: 0.8 }}
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Configuration Panel */}
          {showConfig && (
            <div 
              className="p-4 rounded border space-y-4"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderColor: '#2a2a2a'
              }}
            >
              {/* Poll Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                    Tipo de Enquete
                  </Label>
                  <Select value={pollType} onValueChange={(value) => handleUpdate('poll_type', value)}>
                    <SelectTrigger 
                      style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                      {Object.entries(pollTypes).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="w-4 h-4" />
                            <div>
                              <div>{config.label}</div>
                              <div className="text-xs opacity-60">{config.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                    Status da Enquete
                  </Label>
                  <Select value={pollStatus} onValueChange={(value) => handleUpdate('poll_status', value)}>
                    <SelectTrigger 
                      style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                      {Object.entries(pollStatuses).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                    Exibição dos Resultados
                  </Label>
                  <Select value={resultDisplay} onValueChange={(value) => handleUpdate('result_display', value)}>
                    <SelectTrigger 
                      style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                      {Object.entries(resultDisplayTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multiple Choice Settings */}
              {pollType === 'multiple_choice' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                      Mín. Seleções
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={minSelections}
                      onChange={(e) => handleUpdate('min_selections', Number(e.target.value))}
                      style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                      Máx. Seleções
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={maxSelections}
                      onChange={(e) => handleUpdate('max_selections', Number(e.target.value))}
                      style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                    />
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div>
                <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                  Data Limite (opcional)
                </Label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => handleUpdate('deadline', e.target.value)}
                  style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-results"
                    checked={showResults}
                    onCheckedChange={(checked) => handleUpdate('show_results', checked)}
                  />
                  <Label htmlFor="show-results" className="text-xs" style={{ color: textColor }}>
                    Mostrar Resultados
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-vote-count"
                    checked={showVoteCount}
                    onCheckedChange={(checked) => handleUpdate('show_vote_count', checked)}
                  />
                  <Label htmlFor="show-vote-count" className="text-xs" style={{ color: textColor }}>
                    Número de Votos
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-percentage"
                    checked={showPercentage}
                    onCheckedChange={(checked) => handleUpdate('show_percentage', checked)}
                  />
                  <Label htmlFor="show-percentage" className="text-xs" style={{ color: textColor }}>
                    Porcentagem
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous-voting"
                    checked={anonymousVoting}
                    onCheckedChange={(checked) => handleUpdate('anonymous_voting', checked)}
                  />
                  <Label htmlFor="anonymous-voting" className="text-xs" style={{ color: textColor }}>
                    Votação Anônima
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Options Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium" style={{ color: textColor }}>
                Opções de resposta:
              </Label>
              
              <Button
                size="sm"
                variant="outline"
                onClick={addOption}
                className="flex items-center gap-1"
                style={{ borderColor: borderColor, color: textColor }}
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
            
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <InlineTextEditor
                    value={option.text}
                    onChange={(value) => handleOptionChange(index, 'text', value)}
                    placeholder={`Opção ${index + 1}`}
                    className="w-full"
                    style={{ color: textColor }}
                  />
                </div>
                
                <Input
                  type="color"
                  value={option.color}
                  onChange={(e) => handleOptionChange(index, 'color', e.target.value)}
                  className="w-12 h-8 p-1 cursor-pointer"
                  style={{ backgroundColor: '#212121', borderColor: borderColor }}
                />
                
                {options.length > 2 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOption(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {/* Preview Results */}
          {totalVotes > 0 && (
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: borderColor }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  Preview dos Resultados ({totalVotes} votos)
                </span>
              </div>
              
              {renderResults()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
