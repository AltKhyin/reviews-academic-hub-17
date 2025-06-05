
// ABOUTME: Enhanced snapshot card block with improved visual design
// Displays PICOD framework evidence summary with rich styling

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Users, Target, BarChart3, Lightbulb } from 'lucide-react';
import { ReviewBlock } from '@/types/review';

interface SnapshotCardBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
}

export const SnapshotCardBlock: React.FC<SnapshotCardBlockProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;

  const evidenceLevels = {
    high: { label: 'Alta', color: '#10b981', bg: '#065f46' },
    moderate: { label: 'Moderada', color: '#f59e0b', bg: '#92400e' },
    low: { label: 'Baixa', color: '#ef4444', bg: '#991b1b' },
    very_low: { label: 'Muito Baixa', color: '#6b7280', bg: '#374151' }
  };

  const recommendationStrengths = {
    strong: { label: 'Forte', color: '#10b981' },
    conditional: { label: 'Condicional', color: '#f59e0b' },
    against: { label: 'Contra', color: '#ef4444' }
  };

  const evidenceLevel = evidenceLevels[payload.evidence_level as keyof typeof evidenceLevels] || evidenceLevels.moderate;
  const recommendationStrength = recommendationStrengths[payload.recommendation_strength as keyof typeof recommendationStrengths] || recommendationStrengths.conditional;

  return (
    <Card 
      className="snapshot-card border-l-4 shadow-lg"
      style={{ 
        borderLeftColor: 'var(--block-snapshot-card-accent)',
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl" style={{ color: '#ffffff' }}>
          <FlaskConical 
            className="w-6 h-6" 
            style={{ color: 'var(--block-snapshot-card-accent)' }}
          />
          Cartão de Evidência Científica
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PICOD Framework */}
        <div className="grid gap-4">
          {/* Population */}
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 mt-1 text-blue-400" />
            <div>
              <h4 className="font-semibold text-sm text-blue-400 mb-1">População</h4>
              <p className="text-sm text-gray-300">{payload.population || 'Não especificada'}</p>
            </div>
          </div>

          {/* Intervention */}
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 mt-1 text-green-400" />
            <div>
              <h4 className="font-semibold text-sm text-green-400 mb-1">Intervenção</h4>
              <p className="text-sm text-gray-300">{payload.intervention || 'Não especificada'}</p>
            </div>
          </div>

          {/* Comparison */}
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 mt-1 text-yellow-400" />
            <div>
              <h4 className="font-semibold text-sm text-yellow-400 mb-1">Comparação</h4>
              <p className="text-sm text-gray-300">{payload.comparison || 'Não especificada'}</p>
            </div>
          </div>

          {/* Outcome */}
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 mt-1 text-purple-400" />
            <div>
              <h4 className="font-semibold text-sm text-purple-400 mb-1">Desfecho</h4>
              <p className="text-sm text-gray-300">{payload.outcome || 'Não especificado'}</p>
            </div>
          </div>

          {/* Design */}
          <div className="flex items-start gap-3">
            <FlaskConical className="w-5 h-5 mt-1 text-orange-400" />
            <div>
              <h4 className="font-semibold text-sm text-orange-400 mb-1">Desenho</h4>
              <p className="text-sm text-gray-300">{payload.design || 'Não especificado'}</p>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        {payload.key_findings && payload.key_findings.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: '#ffffff' }}>
              Principais Achados
            </h4>
            <ul className="space-y-2">
              {payload.key_findings.map((finding: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidence and Recommendation */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
          <Badge 
            variant="outline" 
            className="px-3 py-1"
            style={{ 
              backgroundColor: evidenceLevel.bg,
              borderColor: evidenceLevel.color,
              color: evidenceLevel.color
            }}
          >
            Evidência: {evidenceLevel.label}
          </Badge>
          
          <Badge 
            variant="outline" 
            className="px-3 py-1"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: recommendationStrength.color,
              color: recommendationStrength.color
            }}
          >
            Recomendação: {recommendationStrength.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
