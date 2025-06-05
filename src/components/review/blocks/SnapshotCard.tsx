
// ABOUTME: Evidence snapshot card for displaying key study information
// Shows PICOD framework (Population, Intervention, Comparison, Outcome, Design)

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock, SnapshotCardPayload } from '@/types/review';
import { cn } from '@/lib/utils';
import { Users, Target, Scale, TrendingUp, FlaskConical, CheckCircle } from 'lucide-react';

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
            onSectionView?.(block.id.toString());
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'snapshot_card',
              evidence_level: payload.evidence_level,
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
  }, [block.id, onSectionView, onInteraction, payload.evidence_level]);

  const getEvidenceLevelConfig = () => {
    switch (payload.evidence_level) {
      case 'high':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Evidência Alta',
          icon: CheckCircle
        };
      case 'moderate':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Evidência Moderada',
          icon: Target
        };
      case 'low':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Evidência Baixa',
          icon: Scale
        };
      case 'very_low':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Evidência Muito Baixa',
          icon: TrendingUp
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Não Especificado',
          icon: FlaskConical
        };
    }
  };

  const getRecommendationConfig = () => {
    switch (payload.recommendation_strength) {
      case 'strong':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Recomendação Forte'
        };
      case 'conditional':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Recomendação Condicional'
        };
      case 'expert_opinion':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Opinião de Especialista'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Não Especificado'
        };
    }
  };

  const evidenceConfig = getEvidenceLevelConfig();
  const recommendationConfig = getRecommendationConfig();
  const EvidenceIcon = evidenceConfig.icon;

  return (
    <Card className="snapshot-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 my-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6" />
            Resumo da Evidência
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={cn("border", evidenceConfig.color)}>
              <EvidenceIcon className="w-3 h-3 mr-1" />
              {evidenceConfig.label}
            </Badge>
            <Badge className={cn("border", recommendationConfig.color)}>
              {recommendationConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PICOD Framework */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">População</h4>
                <p className="text-gray-700 text-sm">{payload.population}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Intervenção</h4>
                <p className="text-gray-700 text-sm">{payload.intervention}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Comparação</h4>
                <p className="text-gray-700 text-sm">{payload.comparison}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Desfecho</h4>
                <p className="text-gray-700 text-sm">{payload.outcome}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FlaskConical className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Desenho do Estudo</h4>
                <p className="text-gray-700 text-sm">{payload.design}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Findings */}
        {payload.key_findings && payload.key_findings.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Principais Achados
            </h4>
            <ul className="space-y-2">
              {payload.key_findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
