
// ABOUTME: Configuration panel for community header customization
// Allows editing of tagline, statistics display, and header styling

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SidebarConfig } from '@/types/sidebar';

interface CommunityHeaderConfigProps {
  config: SidebarConfig;
  onConfigChange: (updates: Partial<SidebarConfig>) => void;
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
        <div>
          <Label htmlFor="tagline">Tagline da Comunidade</Label>
          <Textarea
            id="tagline"
            value={config.tagline}
            onChange={(e) => onConfigChange({ tagline: e.target.value })}
            placeholder="Digite o tagline da comunidade..."
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-stats"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="show-stats">Mostrar estatísticas da comunidade</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-online-count"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="show-online-count">Mostrar contagem de usuários online</Label>
        </div>
      </CardContent>
    </Card>
  );
};
