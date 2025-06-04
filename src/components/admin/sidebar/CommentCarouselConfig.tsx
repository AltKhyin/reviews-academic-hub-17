
// ABOUTME: Configuration panel for comment carousel display
// Controls comment rotation, filtering, and display format

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommentCarouselConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export const CommentCarouselConfig: React.FC<CommentCarouselConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Carrossel de Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="max-comments">Número de Comentários (1-10)</Label>
          <Input
            id="max-comments"
            type="number"
            min="1"
            max="10"
            value={config.maxComments || 5}
            onChange={(e) => handleChange('maxComments', parseInt(e.target.value) || 5)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="rotation-speed">Velocidade de Rotação (ms)</Label>
          <Input
            id="rotation-speed"
            type="number"
            min="1000"
            max="10000"
            value={config.rotationSpeed || 5000}
            onChange={(e) => handleChange('rotationSpeed', parseInt(e.target.value) || 5000)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="min-votes">Votos Mínimos para Exibir</Label>
          <Input
            id="min-votes"
            type="number"
            min="0"
            value={config.minVotes || 1}
            onChange={(e) => handleChange('minVotes', parseInt(e.target.value) || 1)}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-rotate"
            checked={config.autoRotate ?? true}
            onCheckedChange={(checked) => handleChange('autoRotate', checked)}
          />
          <Label htmlFor="auto-rotate">Rotação automática</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-vote-count"
            checked={config.showVoteCount ?? true}
            onCheckedChange={(checked) => handleChange('showVoteCount', checked)}
          />
          <Label htmlFor="show-vote-count">Mostrar contagem de votos</Label>
        </div>
      </CardContent>
    </Card>
  );
};
