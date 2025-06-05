// ABOUTME: Enhanced snapshot card block with full editability and integrated inline color editing
// Displays and allows editing of evidence summary with inline editors and color customization

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Users, Target, BarChart3, Lightbulb, Settings } from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineColorPicker } from '@/components/editor/inline/InlineColorPicker';
import { Button } from '@/components/ui/button';

interface SnapshotCardBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const SnapshotCardBlock: React.FC<SnapshotCardBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const [showSettings, setShowSettings] = useState(false);
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

  const handleFieldUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const handleColorChange = (colorType: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [`${colorType}_color`]: value
        }
      });
    }
  };

  const handleKeyFindingsUpdate = (index: number, value: string) => {
    const newFindings = [...(payload.key_findings || [])];
    newFindings[index] = value;
    handleFieldUpdate('key_findings', newFindings);
  };

  const addKeyFinding = () => {
    const newFindings = [...(payload.key_findings || []), ''];
    handleFieldUpdate('key_findings', newFindings);
  };

  const removeKeyFinding = (index: number) => {
    const newFindings = [...(payload.key_findings || [])];
    newFindings.splice(index, 1);
    handleFieldUpdate('key_findings', newFindings);
  };

  // Color system integration
  const cardBg = payload.background_color || '#1a1a1a';
  const borderColor = payload.border_color || '#2a2a2a';
  const accentColor = payload.accent_color || '#3b82f6';
  const textColor = payload.text_color || '#ffffff';

  const colorOptions = [
    { name: 'Texto', value: textColor, description: 'Cor principal do texto' },
    { name: 'Fundo', value: cardBg, description: 'Cor de fundo do cartão' },
    { name: 'Borda', value: borderColor, description: 'Cor da borda do cartão' },
    { name: 'Destaque', value: accentColor, description: 'Cor de destaque e ícones' }
  ];

  return (
    <div className="snapshot-card-container group relative">
      {/* Inline Settings Toggle */}
      {!readonly && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0 hover:bg-gray-700 rounded-full"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            title="Configurações do bloco"
          >
            <Settings className="w-3 h-3" style={{ color: '#9ca3af' }} />
          </Button>
        </div>
      )}

      {/* Inline Color Picker */}
      {showSettings && !readonly && (
        <div className="mb-3 p-2 rounded border animate-in slide-in-from-top-2"
             style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <InlineColorPicker
            colors={colorOptions}
            onChange={handleColorChange}
            readonly={readonly}
            compact={false}
          />
        </div>
      )}

      <Card 
        className="snapshot-card border-l-4 shadow-lg"
        style={{ 
          borderLeftColor: accentColor,
          backgroundColor: cardBg,
          borderColor: borderColor
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl" style={{ color: textColor }}>
            <FlaskConical 
              className="w-6 h-6" 
              style={{ color: accentColor }}
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
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-blue-400 mb-1">População</h4>
                <InlineTextEditor
                  value={payload.population || ''}
                  onChange={(value) => handleFieldUpdate('population', value)}
                  placeholder="Descreva a população do estudo..."
                  readonly={readonly}
                  className="text-sm text-gray-300"
                />
              </div>
            </div>

            {/* Intervention */}
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 mt-1 text-green-400" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-green-400 mb-1">Intervenção</h4>
                <InlineTextEditor
                  value={payload.intervention || ''}
                  onChange={(value) => handleFieldUpdate('intervention', value)}
                  placeholder="Descreva a intervenção..."
                  readonly={readonly}
                  className="text-sm text-gray-300"
                />
              </div>
            </div>

            {/* Comparison */}
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 mt-1 text-yellow-400" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-yellow-400 mb-1">Comparação</h4>
                <InlineTextEditor
                  value={payload.comparison || ''}
                  onChange={(value) => handleFieldUpdate('comparison', value)}
                  placeholder="Descreva o que foi comparado..."
                  readonly={readonly}
                  className="text-sm text-gray-300"
                />
              </div>
            </div>

            {/* Outcome */}
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 mt-1 text-purple-400" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-purple-400 mb-1">Desfecho</h4>
                <InlineTextEditor
                  value={payload.outcome || ''}
                  onChange={(value) => handleFieldUpdate('outcome', value)}
                  placeholder="Descreva os desfechos medidos..."
                  readonly={readonly}
                  className="text-sm text-gray-300"
                />
              </div>
            </div>

            {/* Design */}
            <div className="flex items-start gap-3">
              <FlaskConical className="w-5 h-5 mt-1 text-orange-400" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-orange-400 mb-1">Desenho</h4>
                <InlineTextEditor
                  value={payload.design || ''}
                  onChange={(value) => handleFieldUpdate('design', value)}
                  placeholder="Descreva o desenho do estudo..."
                  readonly={readonly}
                  className="text-sm text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm" style={{ color: textColor }}>
                Principais Achados
              </h4>
              {!readonly && (
                <button
                  onClick={addKeyFinding}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-700"
                  style={{ color: accentColor, backgroundColor: '#2a2a2a' }}
                >
                  + Adicionar
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {(payload.key_findings || []).map((finding: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <InlineTextEditor
                      value={finding}
                      onChange={(value) => handleKeyFindingsUpdate(index, value)}
                      placeholder="Digite um achado importante..."
                      readonly={readonly}
                      className="text-sm text-gray-300"
                    />
                  </div>
                  {!readonly && (
                    <button
                      onClick={() => removeKeyFinding(index)}
                      className="text-xs px-1 py-1 rounded hover:bg-red-900 text-red-400 ml-2"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
              {(!payload.key_findings || payload.key_findings.length === 0) && readonly && (
                <li className="text-sm text-gray-500 italic">
                  Nenhum achado principal especificado
                </li>
              )}
            </ul>
          </div>

          {/* Evidence and Recommendation Selectors */}
          {!readonly && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  Nível de Evidência
                </label>
                <select
                  value={payload.evidence_level || 'moderate'}
                  onChange={(e) => handleFieldUpdate('evidence_level', e.target.value)}
                  className="w-full p-2 rounded border text-sm"
                  style={{ 
                    backgroundColor: '#2a2a2a',
                    borderColor: '#374151',
                    color: '#ffffff'
                  }}
                >
                  <option value="high">Alta</option>
                  <option value="moderate">Moderada</option>
                  <option value="low">Baixa</option>
                  <option value="very_low">Muito Baixa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                  Força da Recomendação
                </label>
                <select
                  value={payload.recommendation_strength || 'conditional'}
                  onChange={(e) => handleFieldUpdate('recommendation_strength', e.target.value)}
                  className="w-full p-2 rounded border text-sm"
                  style={{ 
                    backgroundColor: '#2a2a2a',
                    borderColor: '#374151',
                    color: '#ffffff'
                  }}
                >
                  <option value="strong">Forte</option>
                  <option value="conditional">Condicional</option>
                  <option value="against">Contra</option>
                </select>
              </div>
            </div>
          )}

          {/* Evidence and Recommendation Badges */}
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
    </div>
  );
};
