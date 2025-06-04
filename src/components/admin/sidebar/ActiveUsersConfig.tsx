
// ABOUTME: Configuration panel for active users/avatars display
// Controls avatar display settings and online status indicators

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActiveUsersConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export const ActiveUsersConfig: React.FC<ActiveUsersConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Usuários Ativos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="max-avatars">Máximo de Avatares (1-20)</Label>
          <Input
            id="max-avatars"
            type="number"
            min="1"
            max="20"
            value={config.maxAvatars || 8}
            onChange={(e) => handleChange('maxAvatars', parseInt(e.target.value) || 8)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="avatar-size">Tamanho do Avatar</Label>
          <Select 
            value={config.avatarSize || 'md'} 
            onValueChange={(value) => handleChange('avatarSize', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Pequeno</SelectItem>
              <SelectItem value="md">Médio</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-online-status"
            checked={config.showOnlineStatus ?? true}
            onCheckedChange={(checked) => handleChange('showOnlineStatus', checked)}
          />
          <Label htmlFor="show-online-status">Mostrar indicador de status online</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-tooltips"
            checked={config.showTooltips ?? true}
            onCheckedChange={(checked) => handleChange('showTooltips', checked)}
          />
          <Label htmlFor="show-tooltips">Mostrar tooltips com nomes de usuário</Label>
        </div>
      </CardContent>
    </Card>
  );
};
