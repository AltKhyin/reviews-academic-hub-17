
// ABOUTME: Interactive poll block for native reviews
// Allows readers to vote and see results in real-time

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock, CheckCircle } from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { cn } from '@/lib/utils';

interface PollPayload {
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  poll_type: 'single_choice' | 'multiple_choice' | 'rating';
  total_votes: number;
  closes_at?: string;
  is_open: boolean;
}

interface PollBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const PollBlock: React.FC<PollBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as PollPayload;
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onSectionView?.(block.id.toString());
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'poll',
              poll_type: payload.poll_type,
              total_votes: payload.total_votes,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, onSectionView, payload.poll_type, payload.total_votes]);

  const handleOptionSelect = (optionId: string) => {
    if (readonly || hasVoted || !payload.is_open) return;

    if (payload.poll_type === 'single_choice') {
      setSelectedOptions([optionId]);
    } else if (payload.poll_type === 'multiple_choice') {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0) return;

    setHasVoted(true);
    setShowResults(true);

    onInteraction?.(block.id.toString(), 'poll_voted', {
      selected_options: selectedOptions,
      poll_type: payload.poll_type,
      timestamp: Date.now()
    });
  };

  const getOptionPercentage = (optionVotes: number): number => {
    if (payload.total_votes === 0) return 0;
    return Math.round((optionVotes / payload.total_votes) * 100);
  };

  const isPollClosed = payload.closes_at && new Date(payload.closes_at) < new Date();
  const canVote = !readonly && !hasVoted && payload.is_open && !isPollClosed;
  const shouldShowResults = showResults || hasVoted || isPollClosed || !payload.is_open;

  return (
    <div className="poll-block my-6">
      <Card className="overflow-hidden border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                Enquete {payload.poll_type === 'multiple_choice' ? '(Múltipla Escolha)' : '(Escolha Única)'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{payload.total_votes} {payload.total_votes === 1 ? 'voto' : 'votos'}</span>
              </div>
              {payload.closes_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{isPollClosed ? 'Encerrada' : 'Aberta'}</span>
                </div>
              )}
            </div>
          </div>
          
          <CardTitle className="text-xl text-gray-900 dark:text-white leading-tight">
            {payload.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {payload.options.map((option) => {
              const percentage = getOptionPercentage(option.votes);
              const isSelected = selectedOptions.includes(option.id);
              
              return (
                <div key={option.id} className="relative">
                  {shouldShowResults ? (
                    // Results View
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {option.text}
                        </span>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.votes} {option.votes === 1 ? 'voto' : 'votos'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Voting View
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full p-4 h-auto text-left justify-start",
                        isSelected && "ring-2 ring-blue-500",
                        !canVote && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleOptionSelect(option.id)}
                      disabled={!canVote}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex-shrink-0",
                          isSelected 
                            ? "bg-blue-600 border-blue-600" 
                            : "border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                          )}
                        </div>
                        <span className="flex-1 font-medium">
                          {option.text}
                        </span>
                      </div>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {canVote && selectedOptions.length > 0 && !shouldShowResults && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleVote}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Votar ({selectedOptions.length} {selectedOptions.length === 1 ? 'opção selecionada' : 'opções selecionadas'})
              </Button>
            </div>
          )}

          {/* Poll Status */}
          {isPollClosed && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Esta enquete foi encerrada em {new Date(payload.closes_at!).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          
          {!payload.is_open && !isPollClosed && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                Esta enquete está temporariamente fechada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
