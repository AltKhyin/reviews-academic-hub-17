
// ABOUTME: Configuration panel for comment carousel display
// Controls comment rotation, filtering, and display format

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommentCarouselConfigProps {
  onConfigChange: (config: any) => void;
}

export const CommentCarouselConfig: React.FC<CommentCarouselConfigProps> = ({
  onConfigChange
}) => {
  const [maxComments, setMaxComments] = React.useState(5);
  const [rotationSpeed, setRotationSpeed] = React.useState('5000');
  const [minVotes, setMinVotes] = React.useState(1);
  const [autoRotate, setAutoRotate] = React.useState(true);

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
            value={maxComments}
            onChange={(e) => setMaxComments(parseInt(e.target.value) || 5)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="rotation-speed">Velocidade de Rotação</Label>
          <Select value={rotationSpeed} onValueChange={setRotationSpeed}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3000">Rápida (3s)</SelectItem>
              <SelectItem value="5000">Normal (5s)</SelectItem>
              <SelectItem value="8000">Lenta (8s)</SelectItem>
              <SelectItem value="0">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="min-votes">Votos Mínimos para Exibir</Label>
          <Input
            id="min-votes"
            type="number"
            min="0"
            value={minVotes}
            onChange={(e) => setMinVotes(parseInt(e.target.value) || 1)}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-rotate"
            checked={autoRotate}
            onCheckedChange={setAutoRotate}
          />
          <Label htmlFor="auto-rotate">Rotação automática</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-vote-count"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="show-vote-count">Mostrar contagem de votos</Label>
        </div>
      </CardContent>
    </Card>
  );
};
