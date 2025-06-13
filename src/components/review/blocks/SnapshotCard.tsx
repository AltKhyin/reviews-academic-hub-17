
// ABOUTME: Snapshot card block component for displaying key metrics and stats
// Fixed to use proper type imports from review types

import React from 'react';
import { ReviewBlock, SnapshotCardContent } from '@/types/review';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SnapshotCardProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({
  block,
  onUpdate,
  readonly = false
}) => {
  // Type-safe content access
  const cardContent = block.content as SnapshotCardContent;

  if (!cardContent?.title && !cardContent?.value) {
    return (
      <div className="snapshot-card-empty border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
        <div className="text-gray-400">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">📊</span>
          </div>
          <p className="font-medium mb-2">Cartão de estatística vazio</p>
          <p className="text-sm">Configure o título e valor</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!cardContent.trend) return null;
    
    switch (cardContent.trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!cardContent.trend) return 'text-gray-400';
    
    switch (cardContent.trend.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'stable':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div 
      className={cn(
        "snapshot-card border rounded-lg p-6 transition-all duration-200",
        "bg-gray-800/50 border-gray-600 hover:border-gray-500"
      )}
      style={{ 
        borderColor: cardContent.color || '#374151',
        backgroundColor: cardContent.color ? `${cardContent.color}15` : undefined 
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {cardContent.title}
          </h3>
          {cardContent.subtitle && (
            <p className="text-sm text-gray-400">
              {cardContent.subtitle}
            </p>
          )}
        </div>
        
        {cardContent.icon && (
          <div className="text-2xl opacity-60">
            {cardContent.icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div 
          className="text-3xl font-bold mb-2"
          style={{ color: cardContent.color || '#ffffff' }}
        >
          {cardContent.value}
        </div>
        
        {cardContent.description && (
          <p className="text-sm text-gray-300">
            {cardContent.description}
          </p>
        )}
      </div>

      {/* Trend Indicator */}
      {cardContent.trend && (
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={cn("text-sm font-medium", getTrendColor())}>
            {cardContent.trend.percentage && (
              <span>{cardContent.trend.percentage}%</span>
            )}
            {cardContent.trend.period && (
              <span className="ml-1 text-gray-400">
                {cardContent.trend.period}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

// Export as SnapshotCardBlock for consistency with other block components
export const SnapshotCardBlock = SnapshotCard;
