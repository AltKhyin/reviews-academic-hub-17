
// ABOUTME: Configuration panel for top threads display
// Controls thread filtering, sorting, and display options

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface TopThreadsConfigProps {
  onConfigChange: (config: any) => void;
}

export const TopThreadsConfig: React.FC<TopThreadsConfigProps> = ({
  onConfigChange
}) => {
  const [maxThreads, setMaxThreads] = React.useState(5);
  const [sortBy, setSortBy] = React.useState('votes');
  const [timeRange, setTimeRange] = React.useState('week');
  const [threadTypes, setThreadTypes] = React.useState(['discussion', 'question', 'announcement']);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Top Threads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="max-threads">Número de Threads (1-10)</Label>
          <Input
            id="max-threads"
            type="number"
            min="1"
            max="10"
            value={maxThreads}
            onChange={(e) => setMaxThreads(parseInt(e.target.value) || 5)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="sort-by">Ordenar Por</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">Mais Votados</SelectItem>
              <SelectItem value="comments">Mais Comentados</SelectItem>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="views">Mais Visualizados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="time-range">Período de Tempo</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Último Dia</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="all">Todo o Tempo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Tipos de Thread</Label>
          <div className="mt-2 space-y-2">
            {['discussion', 'question', 'announcement', 'poll'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={threadTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setThreadTypes([...threadTypes, type]);
                    } else {
                      setThreadTypes(threadTypes.filter(t => t !== type));
                    }
                  }}
                />
                <Label htmlFor={type} className="capitalize">
                  {type === 'discussion' ? 'Discussão' : 
                   type === 'question' ? 'Pergunta' :
                   type === 'announcement' ? 'Anúncio' : 'Enquete'}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
