
// ABOUTME: Configuration panel for sidebar visual styling
// Controls width, colors, fonts, and spacing

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SidebarStyleConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export const SidebarStyleConfig: React.FC<SidebarStyleConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleChange = (field: string, value: any) => {
    onConfigChange({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Visuais da Barra Lateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Largura da Barra Lateral: {config.width || 320}px</Label>
          <Slider
            value={[config.width || 320]}
            onValueChange={(values) => handleChange('width', values[0])}
            max={500}
            min={280}
            step={10}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="color-theme">Tema de Cores</Label>
          <Select 
            value={config.colorTheme || 'default'} 
            onValueChange={(value) => handleChange('colorTheme', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Padrão</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="blue">Azul</SelectItem>
              <SelectItem value="green">Verde</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bg-color">Cor de Fundo</Label>
            <Input
              id="bg-color"
              type="color"
              value={config.backgroundColor || '#ffffff'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label htmlFor="text-color">Cor do Texto</Label>
            <Input
              id="text-color"
              type="color"
              value={config.textColor || '#000000'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="mt-1 h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
