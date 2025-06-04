
// ABOUTME: Advanced configuration panel for sidebar performance and system settings
// Controls refresh intervals, caching, and debugging options

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarConfig } from '@/types/sidebar';

interface AdvancedSidebarConfigProps {
  config: SidebarConfig;
  onConfigChange: (config: Partial<SidebarConfig>) => void;
}

export const AdvancedSidebarConfig: React.FC<AdvancedSidebarConfigProps> = ({
  config,
  onConfigChange
}) => {
  const advancedConfig = config.sections.find(s => s.id === 'advanced')?.config || {};

  const handleChange = (field: string, value: any) => {
    const updatedSections = config.sections.map(section =>
      section.id === 'advanced'
        ? { ...section, config: { ...section.config, [field]: value } }
        : section
    );
    onConfigChange({ sections: updatedSections });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configurações Avançadas
          <Badge variant="secondary">Admin</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="refresh-interval">Intervalo de Atualização</Label>
          <Select 
            value={(advancedConfig.refreshInterval || 30).toString()} 
            onValueChange={(value) => handleChange('refreshInterval', parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 segundos</SelectItem>
              <SelectItem value="30">30 segundos</SelectItem>
              <SelectItem value="60">1 minuto</SelectItem>
              <SelectItem value="300">5 minutos</SelectItem>
              <SelectItem value="0">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="enable-caching"
            checked={advancedConfig.enableCaching ?? true}
            onCheckedChange={(checked) => handleChange('enableCaching', checked)}
          />
          <Label htmlFor="enable-caching">Habilitar cache de dados</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="preload-data"
            checked={advancedConfig.preloadData ?? true}
            onCheckedChange={(checked) => handleChange('preloadData', checked)}
          />
          <Label htmlFor="preload-data">Pré-carregar dados da sidebar</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="debug-mode"
            checked={advancedConfig.debugMode ?? false}
            onCheckedChange={(checked) => handleChange('debugMode', checked)}
          />
          <Label htmlFor="debug-mode">Modo de debug (logs detalhados)</Label>
        </div>
        
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium">Cache Management</Label>
          <div className="mt-2 space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              Limpar Cache
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Recarregar Dados
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Exportar Configuração
            </Button>
          </div>
        </div>
        
        {advancedConfig.debugMode && (
          <div className="p-3 bg-gray-100 rounded-md">
            <Label className="text-xs font-mono">Debug Info</Label>
            <pre className="text-xs mt-1 text-gray-600">
              Cache Size: 2.3MB{'\n'}
              Last Refresh: 2min ago{'\n'}
              Active Connections: 47
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
