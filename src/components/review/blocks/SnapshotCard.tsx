// ABOUTME: Evidence summary card with PICOD framework
// Displays structured clinical evidence with visual indicators

import React from 'react';
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
  AlertTriangle,
  Icon as LucideIconType // Generic icon type
} from 'lucide-react';
import { SnapshotCardContent } from '@/types/review';
import { cn } from '@/lib/utils';

interface SnapshotCardProps {
  content: SnapshotCardContent; // Type from review.ts which now includes all fields
  onUpdate?: (updates: Partial<SnapshotCardContent>) => void; // Ensure updates match SnapshotCardContent
  readonly?: boolean;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({
  content,
  // onUpdate, // Not used if readonly or if editing is external
  // readonly  // Not used to gate rendering logic here
}) => {
  // content should now have all properties correctly typed from SnapshotCardContent
  // Provide defaults for all potentially undefined fields from the extended SnapshotCardContent type
  const safeContent: SnapshotCardContent = {
    title: content.title || 'Título Indisponível',
    description: content.description,
    imageUrl: content.imageUrl,
    metrics: content.metrics || [],
    timestamp: content.timestamp,
    source: content.source,
    subtitle: content.subtitle,
    value: content.value || '',
    change: content.change || '',
    trend: content.trend || 'neutral',
    icon: content.icon, // No default icon name, let it be undefined if not provided
    evidence_level: content.evidence_level || 'moderate',
    recommendation_strength: content.recommendation_strength || 'conditional',
    population: content.population || 'Não especificada',
    intervention: content.intervention || 'Não especificada',
    comparison: content.comparison || 'Não especificada',
    outcome: content.outcome || 'Não especificado',
    design: content.design || 'Não especificado',
    key_findings: content.key_findings || []
  };

  const getEvidenceLevelConfig = () => {
    switch (safeContent.evidence_level) {
      case 'high':
        return { color: 'bg-green-500 dark:bg-green-600', text: 'Alta Qualidade', icon: CheckCircle2, description: 'Evidência robusta e confiável' };
      case 'moderate':
        return { color: 'bg-yellow-500 dark:bg-yellow-600', text: 'Qualidade Moderada', icon: AlertTriangle, description: 'Evidência com algumas limitações' };
      case 'low':
        return { color: 'bg-orange-500 dark:bg-orange-600', text: 'Baixa Qualidade', icon: AlertTriangle, description: 'Evidência com limitações importantes' };
      case 'very_low':
        return { color: 'bg-red-500 dark:bg-red-600', text: 'Muito Baixa Qualidade', icon: AlertTriangle, description: 'Evidência muito limitada' };
      default:
        return { color: 'bg-gray-500 dark:bg-gray-600', text: 'Não Avaliada', icon: AlertTriangle, description: 'Qualidade da evidência não determinada' };
    }
  };

  const getRecommendationConfig = () => {
    switch (safeContent.recommendation_strength) {
      case 'strong':
        return { color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-700', text: 'Recomendação Forte', description: 'Benefícios claramente superam os riscos' };
      case 'conditional':
        return { color: 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-700', text: 'Recomendação Condicional', description: 'Benefícios provavelmente superam os riscos' };
      case 'expert_opinion':
        return { color: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700', text: 'Opinião de Especialista', description: 'Baseado na experiência clínica' };
      default:
        return { color: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700', text: 'Não Classificada', description: 'Força da recomendação não determinada' };
    }
  };

  const evidenceConfig = getEvidenceLevelConfig();
  const recommendationConfig = getRecommendationConfig();
  const EvidenceIcon = evidenceConfig.icon as LucideIconType; // Cast to generic LucideIcon

  return (
    <Card className="snapshot-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-850 border-blue-200 dark:border-gray-700 shadow-lg my-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            {safeContent.icon === 'FlaskConical' || !safeContent.icon ? <FlaskConical className="w-6 h-6" /> : <span className="text-xl"> {/* Render other icons or text */} </span>}
            {safeContent.title}
          </CardTitle>
          
          <div className="flex items-center gap-2" title={evidenceConfig.description}>
            <div className={cn("w-3 h-3 rounded-full", evidenceConfig.color)}></div>
            <EvidenceIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{evidenceConfig.text}</span>
          </div>
        </div>
        {safeContent.subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{safeContent.subtitle}</p>}
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
              {safeContent.population}
            </p>
          </div>

          {/* Intervention */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Intervenção</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {safeContent.intervention}
            </p>
          </div>

          {/* Comparison */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Comparação</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {safeContent.comparison}
            </p>
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Desfecho</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {safeContent.outcome}
            </p>
          </div>
        </div>

        <Separator className="dark:border-gray-600" />

        {/* Study Design */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {/* Or another relevant icon */}
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Desenho do Estudo</h4>
          </div>
          <Badge variant="outline" className="dark:border-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
            {safeContent.design}
          </Badge>
        </div>

        {/* Key Findings */}
        {safeContent.key_findings && Array.isArray(safeContent.key_findings) && safeContent.key_findings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Principais Achados</h4>
            </div>
            <ul className="space-y-1 list-disc list-inside pl-2">
              {safeContent.key_findings.map((finding, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator className="dark:border-gray-600" />

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
            <Badge className={cn(recommendationConfig.color, "px-2 py-0.5 text-xs")}>
              {recommendationConfig.text}
            </Badge>
            <p className="text-xs text-gray-600 dark:text-gray-400">{recommendationConfig.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
