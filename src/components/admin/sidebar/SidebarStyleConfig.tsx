
// ABOUTME: Configuration panel for sidebar visual styling
// Controls width, colors, fonts, and spacing

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SidebarStyleConfigProps {
  onConfigChange: (config: any) => void;
}

export const SidebarStyleConfig: React.FC<SidebarStyleConfigProps> = ({
  onConfigChange
}) => {
  const [sidebarWidth, setSidebarWidth] = React.useState([320]);
  const [fontSize, setFontSize] = React.useState('md');
  const [colorTheme, setColorTheme] = React.useState('default');
  const [cardSpacing, setCardSpacing] = React.useState([4]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Visuais da Barra Lateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Largura da Barra Lateral: {sidebarWidth[0]}px</Label>
          <Slider
            value={sidebarWidth}
            onValueChange={setSidebarWidth}
            max={500}
            min={280}
            step={10}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="font-size">Tamanho da Fonte</Label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Pequena</SelectItem>
              <SelectItem value="md">Média</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="color-theme">Tema de Cores</Label>
          <Select value={colorTheme} onValueChange={setColorTheme}>
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
        
        <div>
          <Label>Espaçamento entre Cards: {cardSpacing[0]}</Label>
          <Slider
            value={cardSpacing}
            onValueChange={setCardSpacing}
            max={8}
            min={1}
            step={1}
            className="mt-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bg-color">Cor de Fundo</Label>
            <Input
              id="bg-color"
              type="color"
              defaultValue="#ffffff"
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label htmlFor="text-color">Cor do Texto</Label>
            <Input
              id="text-color"
              type="color"
              defaultValue="#000000"
              className="mt-1 h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
