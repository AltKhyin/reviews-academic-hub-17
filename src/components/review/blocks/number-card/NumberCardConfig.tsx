
// ABOUTME: Number card configuration panel with all settings
// Handles format, size, style, and display options

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface NumberCardConfigProps {
  numberFormat: string;
  size: string;
  cardStyle: string;
  showIcon: boolean;
  showComparison: boolean;
  showTarget: boolean;
  customIcon: string;
  trend: string;
  percentage: number;
  textColor: string;
  borderColor: string;
  onUpdate: (field: string, value: any) => void;
}

const numberFormats = {
  integer: 'Inteiro',
  decimal: 'Decimal (1 casa)',
  percentage: 'Porcentagem',
  currency: 'Moeda (R$)',
  scientific: 'Científico'
};

const trendTypes = {
  up: { label: 'Subindo', color: '#10b981' },
  down: { label: 'Descendo', color: '#ef4444' },
  neutral: { label: 'Neutro', color: '#6b7280' },
  stable: { label: 'Estável', color: '#3b82f6' }
};

export const NumberCardConfig: React.FC<NumberCardConfigProps> = ({
  numberFormat,
  size,
  cardStyle,
  showIcon,
  showComparison,
  showTarget,
  customIcon,
  trend,
  percentage,
  textColor,
  borderColor,
  onUpdate
}) => {
  return (
    <div 
      className="p-4 rounded border space-y-4"
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: '#2a2a2a'
      }}
    >
      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Formato do Número
          </Label>
          <Select value={numberFormat} onValueChange={(value) => onUpdate('number_format', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              {Object.entries(numberFormats).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Tamanho do Card
          </Label>
          <Select value={size} onValueChange={(value) => onUpdate('size', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              <SelectItem value="compact">Compacto</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Estilo do Card
          </Label>
          <Select value={cardStyle} onValueChange={(value) => onUpdate('card_style', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              <SelectItem value="default">Padrão</SelectItem>
              <SelectItem value="elevated">Elevado</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="outlined">Contornado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={showIcon}
            onCheckedChange={(checked) => onUpdate('show_icon', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Mostrar Ícone
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showComparison}
            onCheckedChange={(checked) => onUpdate('show_comparison', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Comparação
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showTarget}
            onCheckedChange={(checked) => onUpdate('show_target', checked)}
          />
          <Label className="text-xs" style={{ color: textColor }}>
            Meta
          </Label>
        </div>
      </div>

      {/* Icon Selection */}
      {showIcon && (
        <div>
          <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
            Ícone Personalizado
          </Label>
          <Select value={customIcon} onValueChange={(value) => onUpdate('custom_icon', value)}>
            <SelectTrigger 
              style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
              <SelectItem value="BarChart3">Gráfico de Barras</SelectItem>
              <SelectItem value="Calculator">Calculadora</SelectItem>
              <SelectItem value="Target">Meta</SelectItem>
              <SelectItem value="Percent">Porcentagem</SelectItem>
              <SelectItem value="TrendingUp">Tendência Alta</SelectItem>
              <SelectItem value="TrendingDown">Tendência Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Trend Controls */}
      <div className="flex items-center justify-center gap-4">
        <Select value={trend} onValueChange={(value) => onUpdate('trend', value)}>
          <SelectTrigger 
            className="w-32"
            style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
            {Object.entries(trendTypes).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {trend !== 'neutral' && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={percentage}
              onChange={(e) => onUpdate('percentage', Number(e.target.value))}
              className="w-20"
              style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
            />
            <span style={{ color: textColor }}>%</span>
          </div>
        )}
      </div>
    </div>
  );
};
