
// ABOUTME: Enhanced snapshot card block with customizable sections and badges
// Displays and allows editing of evidence summary with full customization

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, Users, Target, BarChart3, Lightbulb } from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { FindingSectionsManager } from './snapshot/FindingSectionsManager';
import { CustomBadgesManager } from './snapshot/CustomBadgesManager';

interface FindingItem {
  id: string;
  text: string;
  color: string;
}

interface FindingSection {
  id: string;
  label: string;
  items: FindingItem[];
}

interface CustomBadge {
  id: string;
  label: string;
  value: string;
  color: string;
  background_color: string;
}

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
  const content = block.content;

  const handleFieldUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  // Migrate legacy key_findings to new finding_sections format
  const getFindingSections = (): FindingSection[] => {
    if (content.finding_sections && Array.isArray(content.finding_sections)) {
      return content.finding_sections;
    }
    
    // Migrate from legacy key_findings
    if (content.key_findings && Array.isArray(content.key_findings)) {
      const legacySection: FindingSection = {
        id: 'legacy_findings',
        label: 'Principais Achados',
        items: content.key_findings.map((finding: string, index: number) => ({
          id: `legacy_item_${index}`,
          text: finding,
          color: '#3b82f6'
        }))
      };
      return [legacySection];
    }
    
    // Default empty section
    return [{
      id: 'default_findings',
      label: 'Principais Achados',
      items: []
    }];
  };

  const getCustomBadges = (): CustomBadge[] => {
    if (content.custom_badges && Array.isArray(content.custom_badges)) {
      return content.custom_badges;
    }
    
    // Migrate from legacy evidence_level and recommendation_strength
    const badges: CustomBadge[] = [];
    
    if (content.evidence_level) {
      const evidenceLevels: any = {
        high: { label: 'Alta', color: '#10b981' },
        moderate: { label: 'Moderada', color: '#f59e0b' },
        low: { label: 'Baixa', color: '#ef4444' },
        very_low: { label: 'Muito Baixa', color: '#6b7280' }
      };
      
      const level = evidenceLevels[content.evidence_level] || evidenceLevels.moderate;
      badges.push({
        id: 'evidence_level',
        label: 'Evidência',
        value: level.label,
        color: level.color,
        background_color: 'transparent'
      });
    }
    
    if (content.recommendation_strength) {
      const recommendationStrengths: any = {
        strong: { label: 'Forte', color: '#10b981' },
        conditional: { label: 'Condicional', color: '#f59e0b' },
        against: { label: 'Contra', color: '#ef4444' }
      };
      
      const strength = recommendationStrengths[content.recommendation_strength] || recommendationStrengths.conditional;
      badges.push({
        id: 'recommendation_strength',
        label: 'Recomendação',
        value: strength.label,
        color: strength.color,
        background_color: 'transparent'
      });
    }
    
    return badges;
  };

  const handleSectionsUpdate = (sections: FindingSection[]) => {
    handleFieldUpdate('finding_sections', sections);
    // Clear legacy key_findings when using new format
    if (content.key_findings) {
      handleFieldUpdate('key_findings', undefined);
    }
  };

  const handleBadgesUpdate = (badges: CustomBadge[]) => {
    handleFieldUpdate('custom_badges', badges);
    // Clear legacy fields when using new format
    if (content.evidence_level) {
      handleFieldUpdate('evidence_level', undefined);
    }
    if (content.recommendation_strength) {
      handleFieldUpdate('recommendation_strength', undefined);
    }
  };

  // Color system integration
  const cardBg = content.background_color || '#1a1a1a';
  const borderColor = content.border_color || '#2a2a2a';
  const accentColor = content.accent_color || '#3b82f6';
  const textColor = content.text_color || '#ffffff';

  return (
    <div className="snapshot-card-container group relative">
      {/* Inline Settings */}
      {!readonly && (
        <div className="absolute -top-2 -right-2 z-10">
          <InlineBlockSettings
            block={block}
            onUpdate={onUpdate}
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
                  value={content.population || ''}
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
                  value={content.intervention || ''}
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
                  value={content.comparison || ''}
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
                  value={content.outcome || ''}
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
                  value={content.design || ''}
                  onChange={(value) => handleFieldUpdate('design', value)}
                  placeholder="Descreva o desenho do estudo..."
                  readonly={readonly}
                  className="text-sm text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Finding Sections */}
          <FindingSectionsManager
            sections={getFindingSections()}
            readonly={readonly}
            textColor={textColor}
            onUpdateSections={handleSectionsUpdate}
          />

          {/* Custom Badges Manager */}
          <CustomBadgesManager
            badges={getCustomBadges()}
            readonly={readonly}
            onUpdateBadges={handleBadgesUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};
