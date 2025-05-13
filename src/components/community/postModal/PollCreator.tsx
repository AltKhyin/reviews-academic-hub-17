
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart } from 'lucide-react';

interface PollCreatorProps {
  isPollEnabled: boolean;
  togglePoll: () => void;
  pollOptions: string[];
  updatePollOption: (index: number, value: string) => void;
  addPollOption: () => void;
  removePollOption: (index: number) => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({
  isPollEnabled,
  togglePoll,
  pollOptions,
  updatePollOption,
  addPollOption,
  removePollOption
}) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center">
        <Button
          type="button"
          variant={isPollEnabled ? "default" : "outline"}
          size="sm"
          onClick={togglePoll}
          className="gap-2"
        >
          <BarChart size={16} />
          {isPollEnabled ? "Remover Enquete" : "Adicionar Enquete"}
        </Button>
      </div>
      
      {isPollEnabled && (
        <div className="bg-gray-800/20 p-4 rounded-lg border border-gray-700/30 space-y-3">
          <Label>Opções da Enquete</Label>
          
          {pollOptions.map((option, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                value={option}
                onChange={(e) => updatePollOption(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />
              {index >= 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePollOption(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          
          {pollOptions.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPollOption}
              className="w-full"
            >
              + Adicionar Opção
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
