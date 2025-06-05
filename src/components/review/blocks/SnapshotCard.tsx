
// ABOUTME: Executive summary card displaying PICOD framework data
// Key findings and evidence level for quick review understanding

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Target, TrendingUp, FileText, Award } from 'lucide-react';
import { ReviewBlock, SnapshotCardPayload } from '@/types/review';
import { cn } from '@/lib/utils';

interface SnapshotCardProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as SnapshotCardPayload;

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onSectionView?.(block.id);
            onInteraction?.(block.id, 'viewed', {
              block_type: 'snapshot_card',
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
  }, [block.id, onSectionView, onInteraction]);

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'very_low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'conditional':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expert_opinion':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="snapshot-card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
          <FileText className="w-6 h-6" />
          Resumo Executivo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PICOD Framework */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-700">População</h4>
                <p className="text-sm text-gray-900">{payload.population}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Intervenção</h4>
                <p className="text-sm text-gray-900">{payload.intervention}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Comparação</h4>
                <p className="text-sm text-gray-900">{payload.comparison}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Desfecho</h4>
                <p className="text-sm text-gray-900">{payload.outcome}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Desenho</h4>
                <p className="text-sm text-gray-900">{payload.design}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        {payload.key_findings && payload.key_findings.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Principais Achados</h4>
            <ul className="space-y-2">
              {payload.key_findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidence Level and Recommendation */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-blue-200">
          <Badge 
            variant="outline" 
            className={cn("px-3 py-1", getEvidenceLevelColor(payload.evidence_level))}
          >
            Evidência: {payload.evidence_level.replace('_', ' ').toUpperCase()}
          </Badge>
          
          {payload.recommendation_strength && (
            <Badge 
              variant="outline" 
              className={cn("px-3 py-1", getRecommendationColor(payload.recommendation_strength))}
            >
              Recomendação: {payload.recommendation_strength.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
