
// ABOUTME: Enhanced metric card with detailed tooltips and animations
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    comparisonPeriod: string;
  };
  icon: React.ReactNode;
  description: string;
  calculation: string;
  dataSource: string;
  animated?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon,
  description,
  calculation,
  dataSource,
  animated = true,
  className = ''
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-BR');
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      case 'stable':
        return <Minus className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'stable':
        return 'text-yellow-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card 
      className={`
        bg-card border-border transition-all duration-300 hover:shadow-lg hover:border-primary/20
        ${animated ? 'hover-scale' : ''}
        ${className}
      `}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {title}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4 bg-popover border-border" side="top">
                    <div className="space-y-2">
                      <p className="font-medium text-popover-foreground">{description}</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Cálculo:</strong> {calculation}</p>
                        <p><strong>Fonte:</strong> {dataSource}</p>
                        {trend && (
                          <p><strong>Comparação:</strong> {trend.comparisonPeriod}</p>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex items-baseline space-x-2 mt-1">
                <p className="text-2xl font-bold text-foreground">
                  {formatValue(value)}
                </p>
                
                {trend && (
                  <div className={`flex items-center text-sm ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="ml-1">
                      {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                    </span>
                  </div>
                )}
              </div>
              
              {trend && (
                <p className="text-xs text-muted-foreground mt-1">
                  vs. {trend.comparisonPeriod}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
