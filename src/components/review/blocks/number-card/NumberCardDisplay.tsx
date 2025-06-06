
// ABOUTME: Number card display component for readonly view
// Renders the formatted number card with all visual elements

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface NumberCardDisplayProps {
  number: string;
  label: string;
  description: string;
  subtitle: string;
  trend: string;
  percentage: number;
  previousValue: string;
  targetValue: string;
  unit: string;
  numberFormat: string;
  cardStyle: string;
  size: string;
  showComparison: boolean;
  showTarget: boolean;
  showIcon: boolean;
  customIcon: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
  numberColor: string;
  labelColor: string;
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

export const NumberCardDisplay: React.FC<NumberCardDisplayProps> = ({
  number,
  label,
  description,
  subtitle,
  trend,
  percentage,
  previousValue,
  targetValue,
  unit,
  numberFormat,
  cardStyle,
  size,
  showComparison,
  showTarget,
  showIcon,
  customIcon,
  textColor,
  backgroundColor,
  borderColor,
  accentColor,
  numberColor,
  labelColor
}) => {
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

  const IconComponent = getIconComponent(customIcon);
  const TrendIcon = trendTypes[trend]?.icon || Minus;
  const trendColor = trendTypes[trend]?.color || '#6b7280';
  const sizeClasses = getSizeClasses();
  const cardStyleClasses = cardStyles[cardStyle] || cardStyles.default;

  const cardProps: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  return (
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
  );
};
