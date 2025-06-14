// ABOUTME: Dynamic snapshot card component for concise data presentation
// Offers flexible metric display, trend indicators, and evidence levels

import React from 'react';
import { SnapshotCardContent } from '@/types/review';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Info, CheckCircle, AlertTriangle, ExternalLink, LucideIcon } from 'lucide-react'; // Changed LucideIconType to LucideIcon
import { cn } from '@/lib/utils';

interface SnapshotCardProps {
  content: SnapshotCardContent;
  className?: string;
  onInteraction?: (interactionType: string, data?: any) => void;
}

const getTrendIcon = (trend?: SnapshotCardContent['trend']): LucideIcon | null => { // Changed to LucideIcon
  if (!trend) return null;
  if (typeof trend === 'string') {
    switch (trend.toLowerCase()) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'neutral': return Minus;
      default: return Info; // For custom string trends
    }
  }
  return Info; // Fallback
};

const getEvidenceLevelColor = (level?: SnapshotCardContent['evidence_level']): string => {
  if (!level) return 'gray';
  const lowerLevel = typeof level === 'string' ? level.toLowerCase() : '';
  switch (lowerLevel) {
    case 'high': return 'bg-green-500';
    case 'moderate': return 'bg-yellow-500';
    case 'low': return 'bg-orange-500';
    case 'very_low': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getRecommendationStrengthText = (strength?: SnapshotCardContent['recommendation_strength']): string => {
  if (!strength) return 'N/A';
  if (typeof strength === 'string') {
    switch (strength.toLowerCase()) {
      case 'strong': return 'Forte';
      case 'conditional': return 'Condicional';
      case 'expert_opinion': return 'Opinião de Especialista';
      default: return strength; // Show custom string
    }
  }
  return 'N/A';
};

export const SnapshotCard: React.FC<SnapshotCardProps> = ({ content, className, onInteraction }) => {
  const TrendIcon = getTrendIcon(content.trend);
  const IconComponent = content.icon ? Info : null; // Needs mapping from string to LucideIcon

  const handleSourceClick = () => {
    if (content.source && onInteraction) {
      onInteraction('source_click', { url: content.source });
    } else if (content.source) {
      window.open(content.source, '_blank');
    }
  };

  return (
    <Card className={cn("snapshot-card w-full shadow-lg bg-gray-800 border-gray-700 text-white", className)}>
      <CardHeader className="pb-3">
        {content.icon && IconComponent && (
          <IconComponent className="w-6 h-6 mb-2 text-blue-400" />
        )}
        <CardTitle className="text-xl font-semibold text-gray-100">{content.title}</CardTitle>
        {content.subtitle && (
          <CardDescription className="text-sm text-gray-400">{content.subtitle}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {content.description && <p className="text-sm text-gray-300">{content.description}</p>}

        {(content.value !== undefined || content.change !== undefined) && (
          <div className="flex items-baseline space-x-2">
            {content.value !== undefined && (
              <span className="text-3xl font-bold text-blue-300">
                {typeof content.value === 'number' ? content.value.toLocaleString() : content.value}
              </span>
            )}
            {content.change && TrendIcon && (
              <div className={`flex items-center text-sm ${
                content.trend === 'up' ? 'text-green-400' : content.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {content.change}
              </div>
            )}
          </div>
        )}

        {content.metrics && content.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {content.metrics.map((metric, index) => (
              <div key={index} className="p-3 bg-gray-750 rounded-md">
                <p className="text-xs text-gray-400">{metric.label}</p>
                <p className="text-md font-medium text-gray-200">
                  {metric.value}
                  {metric.unit && <span className="text-xs text-gray-400 ml-1">{metric.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {content.key_findings && content.key_findings.length > 0 && (
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-1">Principais Achados:</h4>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              {content.key_findings.map((finding, idx) => <li key={idx}>{finding}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-2">
          {content.population && <div><strong className="text-gray-400">População:</strong> <span className="text-gray-300">{content.population}</span></div>}
          {content.intervention && <div><strong className="text-gray-400">Intervenção:</strong> <span className="text-gray-300">{content.intervention}</span></div>}
          {content.comparison && <div><strong className="text-gray-400">Comparação:</strong> <span className="text-gray-300">{content.comparison}</span></div>}
          {content.outcome && <div><strong className="text-gray-400">Desfecho:</strong> <span className="text-gray-300">{content.outcome}</span></div>}
          {content.design && <div><strong className="text-gray-400">Desenho do Estudo:</strong> <span className="text-gray-300">{content.design}</span></div>}
        </div>


        {content.evidence_level && (
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-xs font-medium text-gray-400">Nível de Evidência:</span>
            <Badge className={cn("text-xs text-white", getEvidenceLevelColor(content.evidence_level))}>
              {typeof content.evidence_level === 'string' ? content.evidence_level : 'N/A'}
            </Badge>
          </div>
        )}

        {content.recommendation_strength && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">Força da Recomendação:</span>
            <Badge variant="secondary" className="text-xs bg-indigo-600 text-white">
              {getRecommendationStrengthText(content.recommendation_strength)}
            </Badge>
          </div>
        )}
      </CardContent>

      {(content.timestamp || content.source) && (
        <CardFooter className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-700">
          {content.timestamp && <span>{new Date(content.timestamp).toLocaleDateString()}</span>}
          {content.source && (
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 text-xs"
              onClick={handleSourceClick}
            >
              Fonte <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
