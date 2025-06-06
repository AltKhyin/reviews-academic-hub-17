
// ABOUTME: Enhanced number card block with comprehensive inline settings and full customization
// Displays prominent numbers with trends, comparisons, and complete inline editing capabilities

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  BarChart3,
  Calculator,
  Percent,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberCardProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

const trendTypes = {
  up: { icon: TrendingUp, label: 'Subindo', color: '#10b981' },
  down: { icon: TrendingDown, label: 'Descendo', color: '#ef4444' },
  neutral: { icon: Minus, label: 'Neutro', color: '#6b7280' },
  stable: { icon: Minus, label: 'Estável', color: '#3b82f6' }
};

const cardStyles = {
  default: 'shadow-lg hover:shadow-xl',
  elevated: 'shadow-xl hover:shadow-2xl',
  minimal: 'shadow-sm hover:shadow-md border-2',
  outlined: 'border-2 shadow-none hover:shadow-sm'
};

const numberFormats = {
  integer: 'Inteiro',
  decimal: 'Decimal (1 casa)',
  percentage: 'Porcentagem',
  currency: 'Moeda (R$)',
  scientific: 'Científico'
};

export const NumberCard: React.FC<NumberCardProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const number = content.number || '0';
  const label = content.label || 'Métrica';
  const description = content.description || '';
  const subtitle = content.subtitle || '';
  const trend = content.trend || 'neutral';
  const percentage = content.percentage || 0;
  const previousValue = content.previous_value || '';
  const targetValue = content.target_value || '';
  const unit = content.unit || '';
  const numberFormat = content.number_format || 'integer';
  const cardStyle = content.card_style || 'default';
  const size = content.size || 'normal'; // compact, normal, large
  const showComparison = content.show_comparison ?? false;
  const showTarget = content.show_target ?? false;
  const showIcon = content.show_icon ?? true;
  const customIcon = content.custom_icon || 'BarChart3';

  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#3b82f6';
  const numberColor = content.number_color || textColor;
  const labelColor = content.label_color || textColor;

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const formatNumber = (value: string, format: string) => {
    const num = parseFloat(value) || 0;
    switch (format) {
      case 'decimal':
        return num.toFixed(1);
      case 'percentage':
        return `${num.toFixed(1)}%`;
      case 'currency':
        return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'scientific':
        return num.toExponential(2);
      default:
        return Math.round(num).toLocaleString('pt-BR');
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      BarChart3,
      Calculator,
      Target,
      Percent,
      TrendingUp,
      TrendingDown,
      Plus,
      ArrowUp,
      ArrowDown
    };
    return icons[iconName] || BarChart3;
  };

  const IconComponent = getIconComponent(customIcon);
  const TrendIcon = trendTypes[trend]?.icon || Minus;
  const trendColor = trendTypes[trend]?.color || '#6b7280';

  const getSizeClasses = () => {
    const sizes = {
      compact: {
        card: 'p-4',
        number: 'text-2xl md:text-3xl',
        label: 'text-sm',
        description: 'text-xs',
        icon: 'w-5 h-5'
      },
      normal: {
        card: 'p-6',
        number: 'text-4xl md:text-5xl',
        label: 'text-base',
        description: 'text-sm',
        icon: 'w-6 h-6'
      },
      large: {
        card: 'p-8',
        number: 'text-5xl md:text-6xl',
        label: 'text-lg',
        description: 'text-base',
        icon: 'w-8 h-8'
      }
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  const cardStyleClasses = cardStyles[cardStyle] || cardStyles.default;

  const cardProps: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  if (readonly) {
    return (
      <div className="number-card-block my-6">
        <Card 
          className={cn("text-center border transition-all duration-200", cardStyleClasses)}
          style={cardProps}
        >
          <CardContent className={sizeClasses.card}>
            <div className="space-y-4">
              {/* Header with icon and subtitle */}
              {(showIcon || subtitle) && (
                <div className="flex items-center justify-center gap-3">
                  {showIcon && (
                    <div 
                      className={cn("rounded-full p-2", sizeClasses.icon)}
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <IconComponent 
                        className={sizeClasses.icon} 
                        style={{ color: accentColor }}
                      />
                    </div>
                  )}
                  {subtitle && (
                    <div 
                      className={cn("font-medium", sizeClasses.description)}
                      style={{ color: textColor, opacity: 0.7 }}
                    >
                      {subtitle}
                    </div>
                  )}
                </div>
              )}

              {/* Main number with trend */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span 
                    className={cn("font-bold tracking-tight", sizeClasses.number)}
                    style={{ color: numberColor }}
                  >
                    {formatNumber(number, numberFormat)}
                  </span>
                  {unit && (
                    <span 
                      className={cn("font-medium", sizeClasses.label)}
                      style={{ color: textColor, opacity: 0.8 }}
                    >
                      {unit}
                    </span>
                  )}
                </div>
                
                {trend !== 'neutral' && percentage !== 0 && (
                  <div className="flex items-center justify-center gap-1">
                    <TrendIcon 
                      className="w-4 h-4" 
                      style={{ color: trendColor }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: trendColor }}
                    >
                      {percentage > 0 ? '+' : ''}{percentage}%
                    </span>
                  </div>
                )}
              </div>

              {/* Label and description */}
              <div className="space-y-2">
                <h3 
                  className={cn("font-semibold", sizeClasses.label)}
                  style={{ color: labelColor }}
                >
                  {label}
                </h3>
                
                {description && (
                  <p 
                    className={cn("leading-relaxed", sizeClasses.description)}
                    style={{ color: textColor, opacity: 0.8 }}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}
              </div>

              {/* Comparison and target */}
              {(showComparison || showTarget) && (
                <div className="pt-4 border-t space-y-2" style={{ borderColor: borderColor }}>
                  {showComparison && previousValue && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: textColor, opacity: 0.6 }}>Anterior:</span>
                      <span style={{ color: textColor, opacity: 0.8 }}>
                        {formatNumber(previousValue, numberFormat)}
                      </span>
                    </div>
                  )}
                  
                  {showTarget && targetValue && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: textColor, opacity: 0.6 }}>Meta:</span>
                      <span style={{ color: accentColor }}>
                        {formatNumber(targetValue, numberFormat)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="number-card-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div className="space-y-4">
        {/* Configuration Panel */}
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
              <Select value={numberFormat} onValueChange={(value) => handleUpdate('number_format', value)}>
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
              <Select value={size} onValueChange={(value) => handleUpdate('size', value)}>
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
              <Select value={cardStyle} onValueChange={(value) => handleUpdate('card_style', value)}>
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
                id="show-icon"
                checked={showIcon}
                onCheckedChange={(checked) => handleUpdate('show_icon', checked)}
              />
              <Label htmlFor="show-icon" className="text-xs" style={{ color: textColor }}>
                Mostrar Ícone
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-comparison"
                checked={showComparison}
                onCheckedChange={(checked) => handleUpdate('show_comparison', checked)}
              />
              <Label htmlFor="show-comparison" className="text-xs" style={{ color: textColor }}>
                Comparação
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-target"
                checked={showTarget}
                onCheckedChange={(checked) => handleUpdate('show_target', checked)}
              />
              <Label htmlFor="show-target" className="text-xs" style={{ color: textColor }}>
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
              <Select value={customIcon} onValueChange={(value) => handleUpdate('custom_icon', value)}>
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
        </div>

        {/* Main Card */}
        <Card 
          className={cn("text-center border transition-all duration-200", cardStyleClasses)}
          style={cardProps}
        >
          <CardContent className={sizeClasses.card}>
            <div className="space-y-4">
              {/* Header with icon and subtitle */}
              {(showIcon || true) && (
                <div className="flex items-center justify-center gap-3">
                  {showIcon && (
                    <div 
                      className={cn("rounded-full p-2", sizeClasses.icon)}
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <IconComponent 
                        className={sizeClasses.icon} 
                        style={{ color: accentColor }}
                      />
                    </div>
                  )}
                  <InlineTextEditor
                    value={subtitle}
                    onChange={(value) => handleUpdate('subtitle', value)}
                    placeholder="Subtítulo (opcional)"
                    className={cn("font-medium", sizeClasses.description)}
                    style={{ color: textColor, opacity: 0.7 }}
                  />
                </div>
              )}

              {/* Main number with trend */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <InlineTextEditor
                    value={number}
                    onChange={(value) => handleUpdate('number', value)}
                    placeholder="0"
                    className={cn("font-bold tracking-tight text-center", sizeClasses.number)}
                    style={{ color: numberColor }}
                  />
                  <InlineTextEditor
                    value={unit}
                    onChange={(value) => handleUpdate('unit', value)}
                    placeholder="unidade"
                    className={cn("font-medium", sizeClasses.label)}
                    style={{ color: textColor, opacity: 0.8 }}
                  />
                </div>
                
                {/* Trend Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Select value={trend} onValueChange={(value) => handleUpdate('trend', value)}>
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
                            <config.icon className="w-4 h-4" style={{ color: config.color }} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {trend !== 'neutral' && (
                    <div className="flex items-center gap-2">
                      <TrendIcon 
                        className="w-4 h-4" 
                        style={{ color: trendColor }}
                      />
                      <Input
                        type="number"
                        value={percentage}
                        onChange={(e) => handleUpdate('percentage', Number(e.target.value))}
                        className="w-20"
                        style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                      />
                      <span style={{ color: trendColor }}>%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Label and description */}
              <div className="space-y-2">
                <InlineTextEditor
                  value={label}
                  onChange={(value) => handleUpdate('label', value)}
                  placeholder="Nome da métrica"
                  className={cn("font-semibold", sizeClasses.label)}
                  style={{ color: labelColor }}
                />
                
                <InlineRichTextEditor
                  value={description}
                  onChange={(value) => handleUpdate('description', value)}
                  placeholder="Descrição da métrica (opcional)"
                  className={cn("leading-relaxed", sizeClasses.description)}
                  style={{ color: textColor, opacity: 0.8 }}
                />
              </div>

              {/* Comparison and target inputs */}
              {(showComparison || showTarget) && (
                <div className="pt-4 border-t space-y-3" style={{ borderColor: borderColor }}>
                  {showComparison && (
                    <div>
                      <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                        Valor Anterior
                      </Label>
                      <InlineTextEditor
                        value={previousValue}
                        onChange={(value) => handleUpdate('previous_value', value)}
                        placeholder="Valor anterior"
                        className="w-full text-sm mt-1"
                        style={{ color: textColor }}
                      />
                    </div>
                  )}
                  
                  {showTarget && (
                    <div>
                      <Label className="text-xs font-medium" style={{ color: textColor, opacity: 0.8 }}>
                        Meta
                      </Label>
                      <InlineTextEditor
                        value={targetValue}
                        onChange={(value) => handleUpdate('target_value', value)}
                        placeholder="Valor da meta"
                        className="w-full text-sm mt-1"
                        style={{ color: textColor }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
