
// ABOUTME: Configuration panel for top threads display
// Controls thread filtering, sorting, and display options

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface TopThreadsConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export const TopThreadsConfig: React.FC<TopThreadsConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  const handleThreadTypeChange = (type: string, checked: boolean) => {
    const currentTypes = config.threadTypes || ['discussion', 'question', 'announcement'];
    let updatedTypes;
    
    if (checked) {
      updatedTypes = [...currentTypes, type];
    } else {
      updatedTypes = currentTypes.filter((t: string) => t !== type);
    }
    
    handleChange('threadTypes', updatedTypes);
  };

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
            value={config.maxThreads || 5}
            onChange={(e) => handleChange('maxThreads', parseInt(e.target.value) || 5)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="sort-by">Ordenar Por</Label>
          <Select 
            value={config.sortBy || 'votes'} 
            onValueChange={(value) => handleChange('sortBy', value)}
          >
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
          <Select 
            value={config.timeRange || 'week'} 
            onValueChange={(value) => handleChange('timeRange', value)}
          >
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
                  checked={(config.threadTypes || ['discussion', 'question', 'announcement']).includes(type)}
                  onCheckedChange={(checked) => handleThreadTypeChange(type, checked as boolean)}
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
