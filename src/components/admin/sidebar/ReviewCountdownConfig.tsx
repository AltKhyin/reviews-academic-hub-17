
// ABOUTME: Configuration panel for next review countdown
// Controls review scheduling and countdown display settings

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarConfig } from '@/types/sidebar';

interface ReviewCountdownConfigProps {
  config: any;
  globalConfig: SidebarConfig;
  onConfigChange: (config: any) => void;
  onGlobalConfigChange: (updates: Partial<SidebarConfig>) => void;
}

export const ReviewCountdownConfig: React.FC<ReviewCountdownConfigProps> = ({
  config,
  globalConfig,
  onConfigChange,
  onGlobalConfigChange
}) => {
  const handleChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Countdown de Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="next-review">Data/Hora da Próxima Review</Label>
          <Input
            id="next-review"
            type="datetime-local"
            value={globalConfig.nextReviewTs ? new Date(globalConfig.nextReviewTs).toISOString().slice(0, 16) : ''}
            onChange={(e) => onGlobalConfigChange({ nextReviewTs: new Date(e.target.value).toISOString() })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="timezone">Fuso Horário</Label>
          <Select 
            value={config.timezone || 'America/Sao_Paulo'} 
            onValueChange={(value) => handleChange('timezone', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
              <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
              <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-progress"
            checked={config.showProgress ?? true}
            onCheckedChange={(checked) => handleChange('showProgress', checked)}
          />
          <Label htmlFor="show-progress">Mostrar barra de progresso</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-days-only"
            checked={config.showDaysOnly ?? false}
            onCheckedChange={(checked) => handleChange('showDaysOnly', checked)}
          />
          <Label htmlFor="show-days-only">Mostrar apenas dias (sem horas)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="urgent-alert"
            checked={config.urgentAlert ?? false}
            onCheckedChange={(checked) => handleChange('urgentAlert', checked)}
          />
          <Label htmlFor="urgent-alert">Alerta quando restarem menos de 24h</Label>
        </div>
      </CardContent>
    </Card>
  );
};
