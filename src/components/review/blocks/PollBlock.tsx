
// ABOUTME: Interactive poll block for reader engagement and data collection
// Supports single/multiple choice voting with real-time results

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReviewBlock } from '@/types/review';
import { BarChart3, Vote, Clock, CheckCircle } from 'lucide-react';

interface PollBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
}

export const PollBlock: React.FC<PollBlockProps> = ({ 
  block, 
  readonly = false,
  onInteraction
}) => {
  const payload = block.payload;
  const question = payload.question || '';
  const options = payload.options || [];
  const pollType = payload.poll_type || 'single_choice';
  const totalVotes = payload.total_votes || 0;
  const opensAt = payload.opens_at;
  const closesAt = payload.closes_at;

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(readonly || totalVotes > 0);

  const isActive = () => {
    const now = new Date();
    const openTime = opensAt ? new Date(opensAt) : new Date(0);
    const closeTime = closesAt ? new Date(closesAt) : null;
    
    return now >= openTime && (!closeTime || now <= closeTime);
  };

  const handleOptionSelect = (optionId: string) => {
    if (hasVoted || !isActive() || readonly) return;

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

  const handleVote = () => {
    if (selectedOptions.length === 0 || hasVoted) return;

    setHasVoted(true);
    setShowResults(true);

    if (onInteraction) {
      onInteraction(String(block.id), 'poll_vote', {
        selectedOptions,
        pollType
      });
    }
  };

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const pollStatus = !isActive() ? 'closed' : hasVoted ? 'voted' : 'active';

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
            <BarChart3 className="w-5 h-5" style={{ color: '#06b6d4' }} />
            Enquete Interativa
            
            <div className="flex gap-2 ml-auto">
              {pollStatus === 'voted' && (
                <Badge 
                  variant="outline"
                  style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10b981',
                    color: '#10b981'
                  }}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Votado
                </Badge>
              )}
              
              {pollStatus === 'closed' && (
                <Badge 
                  variant="outline"
                  style={{ 
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderColor: '#6b7280',
                    color: '#6b7280'
                  }}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Encerrada
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question */}
          <div>
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: '#ffffff' }}
            >
              {question}
            </h3>
            
            <div className="flex items-center gap-4 text-sm" style={{ color: '#9ca3af' }}>
              <span>Total de votos: {totalVotes}</span>
              <span>Tipo: {pollType === 'single_choice' ? 'Escolha única' : 'Múltipla escolha'}</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option: any) => {
              const isSelected = selectedOptions.includes(option.id);
              const percentage = getPercentage(option.votes);
              
              return (
                <div key={option.id} className="space-y-2">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={hasVoted || !isActive() || readonly}
                    style={{
                      backgroundColor: isSelected ? '#06b6d4' : 'transparent',
                      borderColor: isSelected ? '#06b6d4' : '#2a2a2a',
                      color: isSelected ? '#ffffff' : '#ffffff'
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Vote className="w-4 h-4" />
                      <span className="flex-1">{option.text}</span>
                      {showResults && (
                        <Badge variant="secondary" style={{ color: '#ffffff' }}>
                          {option.votes} ({percentage}%)
                        </Badge>
                      )}
                    </div>
                  </Button>
                  
                  {/* Results Bar */}
                  {showResults && (
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      style={{ backgroundColor: '#2a2a2a' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {!hasVoted && !readonly && isActive() && selectedOptions.length > 0 && (
            <Button 
              onClick={handleVote}
              className="w-full"
              style={{ 
                backgroundColor: '#06b6d4',
                color: '#ffffff'
              }}
            >
              <Vote className="w-4 h-4 mr-2" />
              Confirmar Voto
            </Button>
          )}

          {/* Results Toggle */}
          {!readonly && (hasVoted || totalVotes > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResults(!showResults)}
              className="w-full"
              style={{ color: '#9ca3af' }}
            >
              {showResults ? 'Ocultar Resultados' : 'Ver Resultados'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
