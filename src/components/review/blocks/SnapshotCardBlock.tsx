// ABOUTME: Wrapper for SnapshotCard, handling editing logic.
import React from 'react';
import { ReviewBlock, SnapshotCardContent as SnapshotCardContentType } from '@/types/review';
import { SnapshotCard } from './SnapshotCard'; // The display component
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button'; // Ensure Button is imported

interface SnapshotCardBlockProps {
  block: ReviewBlock; // Contains content of type SnapshotCardContentType
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
  onInteraction?: (interactionType: string, data?: any) => void; // Optional interaction handler
}

export const SnapshotCardBlock: React.FC<SnapshotCardBlockProps> = ({
  block,
  onUpdate,
  readonly,
  onInteraction, // Added to props
}) => {
  const content = block.content as SnapshotCardContentType || {} as SnapshotCardContentType;

  const handleContentChange = (field: keyof SnapshotCardContentType, value: any) => {
    if (onUpdate) {
      onUpdate({
        ...block, // Keep other block properties
        content: {
          ...content,
          [field]: value,
        }
      });
    }
  };

  // Simplified metrics handling for the editor part.
  // A more complex UI would be needed for adding/removing/editing individual metrics.
  const handleMetricChange = (index: number, field: 'label' | 'value' | 'unit', value: string) => {
    if (onUpdate) {
      const newMetrics = [...(content.metrics || [])];
      if (newMetrics[index]) {
        newMetrics[index] = { ...newMetrics[index], [field]: value };
        onUpdate({ content: { ...content, metrics: newMetrics } });
      }
    }
  };

  if (readonly) {
    return <SnapshotCard content={content} onInteraction={onInteraction ? (type, data) => onInteraction(type, data) : undefined} />;
  }

  return (
    <Card className="p-4 bg-gray-850 border-gray-700">
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor={`sc-title-${block.id}`} className="text-xs text-gray-400">Título</Label>
          <Input
            id={`sc-title-${block.id}`}
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor={`sc-desc-${block.id}`} className="text-xs text-gray-400">Descrição</Label>
          <Textarea
            id={`sc-desc-${block.id}`}
            value={content.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white min-h-[60px]"
          />
        </div>
        <div>
          <Label htmlFor={`sc-img-${block.id}`} className="text-xs text-gray-400">URL da Imagem</Label>
          <Input
            id={`sc-img-${block.id}`}
            value={content.imageUrl || ''}
            onChange={(e) => handleContentChange('imageUrl', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        {/* Basic Metrics Editor (example for first metric) */}
        {content.metrics && content.metrics.length > 0 && (
          <div className="space-y-1 border-t border-gray-700 pt-2 mt-2">
            <Label className="text-xs text-gray-400">Métrica 1 (Exemplo)</Label>
            <Input 
              placeholder="Rótulo da Métrica" 
              value={content.metrics[0].label} 
              onChange={e => handleMetricChange(0, 'label', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm" 
            />
            <Input 
              placeholder="Valor" 
              value={String(content.metrics[0].value)} 
              onChange={e => handleMetricChange(0, 'value', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm"
            />
            <Input 
              placeholder="Unidade (opcional)" 
              value={content.metrics[0].unit || ''} 
              onChange={e => handleMetricChange(0, 'unit', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm"
            />
          </div>
        )}
         <p className="text-xxs text-gray-500">Nota: Editor de métricas simplificado. Adicione/remova métricas via JSON por enquanto.</p>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Pré-visualização abaixo (se implementado em SnapshotCard):
        <div className="mt-2 w-full border border-dashed border-gray-600 p-2 rounded">
             <SnapshotCard content={content} />
        </div>
      </CardFooter>
    </Card>
  );
};
