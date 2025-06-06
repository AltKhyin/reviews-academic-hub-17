
// ABOUTME: Poll voting interface component
// Handles vote selection and submission logic

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, CheckSquare, Square, Vote } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  color?: string;
}

interface PollVotingProps {
  options: PollOption[];
  pollType: string;
  selectedOptions: number[];
  minSelections: number;
  maxSelections: number;
  isPollActive: boolean;
  hasVoted: boolean;
  canVote: boolean;
  textColor: string;
  borderColor: string;
  accentColor: string;
  onOptionSelect: (optionIndex: number) => void;
  onVote: () => void;
}

export const PollVoting: React.FC<PollVotingProps> = ({
  options,
  pollType,
  selectedOptions,
  minSelections,
  maxSelections,
  isPollActive,
  hasVoted,
  canVote,
  textColor,
  borderColor,
  accentColor,
  onOptionSelect,
  onVote
}) => {
  if (hasVoted || !isPollActive) return null;

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
              onClick={() => onOptionSelect(index)}
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
          onClick={onVote}
          disabled={!canVote}
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
