
// ABOUTME: Configuration panel for weekly polls
// Manages poll settings and behavior

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PollConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export const PollConfig: React.FC<PollConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Enquetes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="allow-multiple"
            checked={config.allowMultiple ?? false}
            onCheckedChange={(checked) => handleChange('allowMultiple', checked)}
          />
          <Label htmlFor="allow-multiple">Permitir múltiplas escolhas</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-results"
            checked={config.showResults ?? true}
            onCheckedChange={(checked) => handleChange('showResults', checked)}
          />
          <Label htmlFor="show-results">Mostrar resultados enquanto ativa</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous-voting"
            checked={config.anonymousVoting ?? false}
            onCheckedChange={(checked) => handleChange('anonymousVoting', checked)}
          />
          <Label htmlFor="anonymous-voting">Votação anônima</Label>
        </div>
      </CardContent>
    </Card>
  );
};
