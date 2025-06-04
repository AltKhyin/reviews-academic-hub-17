
// ABOUTME: Advanced configuration panel for sidebar performance and system settings
// Controls refresh intervals, caching, and debugging options

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdvancedSidebarConfigProps {
  onConfigChange: (config: any) => void;
}

export const AdvancedSidebarConfig: React.FC<AdvancedSidebarConfigProps> = ({
  onConfigChange
}) => {
  const [refreshInterval, setRefreshInterval] = React.useState('30');
  const [enableCaching, setEnableCaching] = React.useState(true);
  const [debugMode, setDebugMode] = React.useState(false);
  const [preloadData, setPreloadData] = React.useState(true);

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
          <Label htmlFor="refresh-interval">Intervalo de Atualização (segundos)</Label>
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
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
            checked={enableCaching}
            onCheckedChange={setEnableCaching}
          />
          <Label htmlFor="enable-caching">Habilitar cache de dados</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="preload-data"
            checked={preloadData}
            onCheckedChange={setPreloadData}
          />
          <Label htmlFor="preload-data">Pré-carregar dados da sidebar</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="lazy-loading"
            checked={true}
            onCheckedChange={() => {}}
          />
          <Label htmlFor="lazy-loading">Carregamento lazy de componentes</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="debug-mode"
            checked={debugMode}
            onCheckedChange={setDebugMode}
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
        
        {debugMode && (
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
