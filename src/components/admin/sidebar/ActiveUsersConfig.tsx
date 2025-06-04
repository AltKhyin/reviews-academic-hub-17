
// ABOUTME: Configuration panel for active users/avatars display
// Controls avatar display settings and online status indicators

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActiveUsersConfigProps {
  onConfigChange: (config: any) => void;
}

export const ActiveUsersConfig: React.FC<ActiveUsersConfigProps> = ({
  onConfigChange
}) => {
  const [maxAvatars, setMaxAvatars] = React.useState(8);
  const [avatarSize, setAvatarSize] = React.useState('md');
  const [showOnlineStatus, setShowOnlineStatus] = React.useState(true);

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
            value={maxAvatars}
            onChange={(e) => setMaxAvatars(parseInt(e.target.value) || 8)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="avatar-size">Tamanho do Avatar</Label>
          <Select value={avatarSize} onValueChange={setAvatarSize}>
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
            checked={showOnlineStatus}
            onCheckedChange={setShowOnlineStatus}
          />
          <Label htmlFor="show-online-status">Mostrar indicador de status online</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-tooltips"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="show-tooltips">Mostrar tooltips com nomes de usuário</Label>
        </div>
      </CardContent>
    </Card>
  );
};
