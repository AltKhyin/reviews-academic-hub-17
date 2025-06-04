
// ABOUTME: Configuration panel for community header customization
// Allows editing of tagline, statistics display, and header styling

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CommunityHeaderConfigProps {
  config: any;
  onConfigChange: (updates: any) => void;
}

export const CommunityHeaderConfig: React.FC<CommunityHeaderConfigProps> = ({
  config,
  onConfigChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Cabeçalho da Comunidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-stats"
            checked={config.showStats ?? true}
            onCheckedChange={(checked) => onConfigChange({ showStats: checked })}
          />
          <Label htmlFor="show-stats">Mostrar estatísticas da comunidade</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-online-count"
            checked={config.showOnlineCount ?? true}
            onCheckedChange={(checked) => onConfigChange({ showOnlineCount: checked })}
          />
          <Label htmlFor="show-online-count">Mostrar contagem de usuários online</Label>
        </div>
      </CardContent>
    </Card>
  );
};
