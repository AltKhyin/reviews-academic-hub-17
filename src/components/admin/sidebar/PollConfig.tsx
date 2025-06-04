
// ABOUTME: Configuration panel for weekly polls
// Allows creating, editing, and managing poll settings

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface PollConfigProps {
  onConfigChange: (config: any) => void;
}

export const PollConfig: React.FC<PollConfigProps> = ({
  onConfigChange
}) => {
  const [pollQuestion, setPollQuestion] = React.useState('');
  const [pollOptions, setPollOptions] = React.useState(['', '']);
  const [pollDuration, setPollDuration] = React.useState('7');
  const [allowMultiple, setAllowMultiple] = React.useState(false);
  const [showResults, setShowResults] = React.useState(true);

  const addOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Enquetes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="poll-question">Pergunta da Enquete</Label>
          <Textarea
            id="poll-question"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Digite a pergunta da enquete..."
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Opções de Resposta</Label>
          <div className="mt-2 space-y-2">
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                  className="flex-1"
                />
                {pollOptions.length > 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Opção
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="poll-duration">Duração da Enquete</Label>
          <Select value={pollDuration} onValueChange={setPollDuration}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Dia</SelectItem>
              <SelectItem value="3">3 Dias</SelectItem>
              <SelectItem value="7">7 Dias</SelectItem>
              <SelectItem value="14">14 Dias</SelectItem>
              <SelectItem value="30">30 Dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="allow-multiple"
            checked={allowMultiple}
            onCheckedChange={setAllowMultiple}
          />
          <Label htmlFor="allow-multiple">Permitir múltiplas escolhas</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-results"
            checked={showResults}
            onCheckedChange={setShowResults}
          />
          <Label htmlFor="show-results">Mostrar resultados enquanto ativa</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous-voting"
            checked={false}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="anonymous-voting">Votação anônima</Label>
        </div>
        
        <Button className="w-full mt-4">
          Salvar Enquete
        </Button>
      </CardContent>
    </Card>
  );
};
