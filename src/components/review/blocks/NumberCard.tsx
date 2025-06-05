
// ABOUTME: Statistical highlight card for key numbers and metrics
// Displays important statistics with optional trend indicators and custom styling

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReviewBlock, NumberCardPayload } from '@/types/review';
import { cn } from '@/lib/utils';

interface NumberCardProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const NumberCard: React.FC<NumberCardProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as NumberCardPayload;
  const customStyles = block.meta?.styles || {};

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'number_card',
              number_value: payload.number,
              label: payload.label,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, payload.number, payload.label]);

  const getTrendIcon = () => {
    switch (payload.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'neutral':
        return <Minus className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (payload.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-500';
      default:
        return '';
    }
  };

  const cardStyle = {
    backgroundColor: customStyles.backgroundColor || '#f0f9ff',
    borderColor: customStyles.borderColor || '#bfdbfe'
  };

  const numberStyle = {
    color: customStyles.numberColor || '#1e40af'
  };

  const labelStyle = {
    color: customStyles.labelColor || '#374151'
  };

  return (
    <div 
      className="number-card my-6"
      data-block-id={block.id}
    >
      <Card 
        className="hover:shadow-md transition-shadow duration-200 border-2"
        style={cardStyle}
      >
        <CardContent className="p-6 text-center">
          {/* Main Number */}
          <div className="mb-2">
            <span 
              className="text-4xl md:text-5xl font-bold"
              style={numberStyle}
            >
              {payload.number}
            </span>
            {payload.percentage !== undefined && (
              <span className={cn("text-lg font-semibold ml-2", getTrendColor())}>
                {payload.percentage > 0 ? '+' : ''}{payload.percentage}%
              </span>
            )}
          </div>

          {/* Label */}
          <h3 
            className="text-lg font-semibold mb-1"
            style={labelStyle}
          >
            {payload.label}
          </h3>

          {/* Description */}
          {payload.description && (
            <p className="text-sm text-gray-600 mb-3">
              {payload.description}
            </p>
          )}

          {/* Trend Indicator */}
          {payload.trend && (
            <div className="flex items-center justify-center gap-1">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {payload.trend === 'up' && 'Aumentou'}
                {payload.trend === 'down' && 'Diminuiu'}
                {payload.trend === 'neutral' && 'Estável'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
