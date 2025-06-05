
// ABOUTME: Evidence summary card with PICOD framework
// Displays structured clinical evidence with visual indicators

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Activity, 
  GitCompare, 
  Target, 
  FlaskConical,
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ReviewBlock, SnapshotCardContent } from '@/types/review';
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
  const content = block.content as SnapshotCardContent;

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id.toString(), 'viewed', {
              block_type: 'snapshot_card',
              evidence_level: content.evidence_level,
              recommendation_strength: content.recommendation_strength,
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
  }, [block.id, onInteraction, content.evidence_level, content.recommendation_strength]);

  const getEvidenceLevelConfig = () => {
    switch (content.evidence_level) {
      case 'high':
        return {
          color: 'bg-green-500',
          text: 'Alta Qualidade',
          icon: CheckCircle2,
          description: 'Evidência robusta e confiável'
        };
      case 'moderate':
        return {
          color: 'bg-yellow-500',
          text: 'Qualidade Moderada',
          icon: AlertTriangle,
          description: 'Evidência com algumas limitações'
        };
      case 'low':
        return {
          color: 'bg-orange-500',
          text: 'Baixa Qualidade',
          icon: AlertTriangle,
          description: 'Evidência com limitações importantes'
        };
      case 'very_low':
        return {
          color: 'bg-red-500',
          text: 'Muito Baixa Qualidade',
          icon: AlertTriangle,
          description: 'Evidência muito limitada'
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Não Avaliada',
          icon: AlertTriangle,
          description: 'Qualidade da evidência não determinada'
        };
    }
  };

  const getRecommendationConfig = () => {
    switch (content.recommendation_strength) {
      case 'strong':
        return {
          color: 'text-green-700 bg-green-100 border-green-200',
          text: 'Recomendação Forte',
          description: 'Benefícios claramente superam os riscos'
        };
      case 'conditional':
        return {
          color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
          text: 'Recomendação Condicional',
          description: 'Benefícios provavelmente superam os riscos'
        };
      case 'expert_opinion':
        return {
          color: 'text-purple-700 bg-purple-100 border-purple-200',
          text: 'Opinião de Especialista',
          description: 'Baseado na experiência clínica'
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          text: 'Não Classificada',
          description: 'Força da recomendação não determinada'
        };
    }
  };

  const evidenceConfig = getEvidenceLevelConfig();
  const recommendationConfig = getRecommendationConfig();
  const EvidenceIcon = evidenceConfig.icon;

  return (
    <Card className="snapshot-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 shadow-lg my-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <FlaskConical className="w-6 h-6" />
            Cartão de Evidência Científica
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", evidenceConfig.color)}></div>
            <EvidenceIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PICOD Framework */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Population */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">População</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {content.population || 'Não especificada'}
            </p>
          </div>

          {/* Intervention */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Intervenção</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {content.intervention || 'Não especificada'}
            </p>
          </div>

          {/* Comparison */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Comparação</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {content.comparison || 'Não especificada'}
            </p>
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Desfecho</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {content.outcome || 'Não especificado'}
            </p>
          </div>
        </div>

        <Separator className="dark:border-gray-700" />

        {/* Study Design */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Desenho do Estudo</h4>
          </div>
          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
            {content.design || 'Não especificado'}
          </Badge>
        </div>

        {/* Key Findings */}
        {content.key_findings && content.key_findings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Principais Achados</h4>
            </div>
            <ul className="space-y-1">
              {content.key_findings.map((finding, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator className="dark:border-gray-700" />

        {/* Evidence Quality and Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Qualidade da Evidência</h4>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", evidenceConfig.color)}></div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{evidenceConfig.text}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{evidenceConfig.description}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Força da Recomendação</h4>
            <Badge className={recommendationConfig.color}>
              {recommendationConfig.text}
            </Badge>
            <p className="text-xs text-gray-600 dark:text-gray-400">{recommendationConfig.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
