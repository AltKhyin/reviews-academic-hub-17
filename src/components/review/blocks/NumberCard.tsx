
// ABOUTME: Number card block with inline editing for statistics and metrics
// Displays prominent numbers with trends and direct editing capabilities

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface NumberCardProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const NumberCard: React.FC<NumberCardProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload;
  const number = payload.number || '0';
  const label = payload.label || 'Métrica';
  const description = payload.description || '';
  const trend = payload.trend || 'neutral';
  const percentage = payload.percentage || 0;

  // Color system integration
  const textColor = payload.text_color || '#ffffff';
  const backgroundColor = payload.background_color || '#1a1a1a';
  const borderColor = payload.border_color || '#2a2a2a';
  const accentColor = payload.accent_color || '#3b82f6';

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const TrendIcon = getTrendIcon(trend);
  const trendColor = getTrendColor(trend);

  const cardStyle: React.CSSProperties = {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    color: textColor
  };

  if (readonly) {
    return (
      <div className="number-card-block my-6">
        <Card 
          className="text-center border shadow-lg transition-all duration-200 hover:shadow-xl"
          style={cardStyle}
        >
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <div 
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                  style={{ color: textColor }}
                >
                  {number}
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
                      {Math.abs(percentage)}%
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: textColor }}
                >
                  {label}
                </h3>
                
                {description && (
                  <p 
                    className="text-sm mt-2"
                    style={{ color: textColor, opacity: 0.8 }}
                  >
                    {description}
                  </p>
                )}
              </div>
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

      <Card 
        className="text-center border shadow-lg transition-all duration-200 hover:shadow-xl"
        style={cardStyle}
      >
        <CardContent className="p-8">
          <div className="space-y-4">
            {/* Main Number */}
            <div className="space-y-2">
              <InlineTextEditor
                value={number}
                onChange={(value) => handleUpdate('number', value)}
                placeholder="0"
                className="text-4xl md:text-5xl font-bold tracking-tight text-center"
                style={{ color: textColor }}
              />
              
              {/* Trend Controls */}
              <div className="flex items-center justify-center gap-4">
                <Select 
                  value={trend} 
                  onValueChange={(value) => handleUpdate('trend', value)}
                >
                  <SelectTrigger 
                    className="w-32"
                    style={{ backgroundColor: '#212121', borderColor: borderColor, color: textColor }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                    <SelectItem value="neutral">Neutro</SelectItem>
                    <SelectItem value="up">Subindo</SelectItem>
                    <SelectItem value="down">Descendo</SelectItem>
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

            {/* Label and Description */}
            <div className="space-y-2">
              <InlineTextEditor
                value={label}
                onChange={(value) => handleUpdate('label', value)}
                placeholder="Nome da métrica"
                className="text-lg font-semibold"
                style={{ color: textColor }}
              />
              
              <InlineTextEditor
                value={description}
                onChange={(value) => handleUpdate('description', value)}
                placeholder="Descrição da métrica (opcional)"
                multiline
                className="text-sm"
                style={{ color: textColor, opacity: 0.8 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
