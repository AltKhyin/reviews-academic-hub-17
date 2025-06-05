
// ABOUTME: Number card block for highlighting key statistics and metrics
// Displays prominent numbers with trends and contextual information

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NumberCardProps {
  block: ReviewBlock;
  readonly?: boolean;
}

export const NumberCard: React.FC<NumberCardProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;
  const number = payload.number || '0';
  const label = payload.label || 'Métrica';
  const description = payload.description || '';
  const trend = payload.trend || 'neutral';
  const percentage = payload.percentage || 0;

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

  return (
    <div className="number-card-block my-6">
      <Card 
        className="text-center border shadow-lg transition-all duration-200 hover:shadow-xl"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <CardContent className="p-8">
          <div className="space-y-4">
            {/* Main Number */}
            <div className="space-y-2">
              <div 
                className="text-4xl md:text-5xl font-bold tracking-tight"
                style={{ color: '#ffffff' }}
              >
                {number}
              </div>
              
              {/* Trend Indicator */}
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

            {/* Label */}
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: '#ffffff' }}
              >
                {label}
              </h3>
              
              {/* Description */}
              {description && (
                <p 
                  className="text-sm mt-2"
                  style={{ color: '#d1d5db' }}
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
};
