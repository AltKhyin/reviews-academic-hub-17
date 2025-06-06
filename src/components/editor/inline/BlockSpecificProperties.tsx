
// ABOUTME: Block-specific properties editor for inline settings
// Handles type-specific settings for all block types in the system

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface BlockSpecificPropertiesProps {
  block: ReviewBlock;
  onContentUpdate: (field: string, value: any) => void;
}

export const BlockSpecificProperties: React.FC<BlockSpecificPropertiesProps> = ({
  block,
  onContentUpdate
}) => {
  const renderHeadingProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Nível do Título</Label>
        <Select 
          value={block.content.level?.toString() || '2'} 
          onValueChange={(value) => onContentUpdate('level', parseInt(value))}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1 - Principal</SelectItem>
            <SelectItem value="2">H2 - Seção</SelectItem>
            <SelectItem value="3">H3 - Subseção</SelectItem>
            <SelectItem value="4">H4 - Subtítulo</SelectItem>
            <SelectItem value="5">H5 - Menor</SelectItem>
            <SelectItem value="6">H6 - Mínimo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCalloutProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Tipo de Destaque</Label>
        <Select 
          value={block.content.type || 'info'} 
          onValueChange={(value) => onContentUpdate('type', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Informação</SelectItem>
            <SelectItem value="warning">Aviso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Título</Label>
        <Input
          value={block.content.title || ''}
          onChange={(e) => onContentUpdate('title', e.target.value)}
          className="h-8 text-xs"
          placeholder="Título do destaque"
        />
      </div>
    </div>
  );

  const renderNumberCardProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Tendência</Label>
        <Select 
          value={block.content.trend || 'neutral'} 
          onValueChange={(value) => onContentUpdate('trend', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="up">Crescimento</SelectItem>
            <SelectItem value="down">Queda</SelectItem>
            <SelectItem value="neutral">Neutro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Número</Label>
        <Input
          value={block.content.number || ''}
          onChange={(e) => onContentUpdate('number', e.target.value)}
          className="h-8 text-xs"
          placeholder="Valor numérico"
        />
      </div>
    </div>
  );

  const renderSnapshotCardProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Nível de Evidência</Label>
        <Select 
          value={block.content.evidence_level || 'moderate'} 
          onValueChange={(value) => onContentUpdate('evidence_level', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="moderate">Moderada</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="very_low">Muito Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Força da Recomendação</Label>
        <Select 
          value={block.content.recommendation_strength || 'weak'} 
          onValueChange={(value) => onContentUpdate('recommendation_strength', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strong">Forte</SelectItem>
            <SelectItem value="weak">Fraca</SelectItem>
            <SelectItem value="conditional">Condicional</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPollProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Tipo de Enquete</Label>
        <Select 
          value={block.content.poll_type || 'single_choice'} 
          onValueChange={(value) => onContentUpdate('poll_type', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">Escolha Única</SelectItem>
            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
            <SelectItem value="rating">Avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Mostrar Resultados</Label>
        <Switch
          checked={block.content.show_results || false}
          onCheckedChange={(checked) => onContentUpdate('show_results', checked)}
          className="scale-75"
        />
      </div>
    </div>
  );

  const renderFigureProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>URL da Imagem</Label>
        <Input
          value={block.content.image_url || ''}
          onChange={(e) => onContentUpdate('image_url', e.target.value)}
          className="h-8 text-xs"
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Texto Alternativo</Label>
        <Input
          value={block.content.alt_text || ''}
          onChange={(e) => onContentUpdate('alt_text', e.target.value)}
          className="h-8 text-xs"
          placeholder="Descrição da imagem"
        />
      </div>
    </div>
  );

  const renderListProperties = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Lista Ordenada</Label>
        <Switch
          checked={block.content.ordered || false}
          onCheckedChange={(checked) => onContentUpdate('ordered', checked)}
          className="scale-75"
        />
      </div>
    </div>
  );

  const renderCodeProperties = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: '#d1d5db' }}>Linguagem</Label>
        <Select 
          value={block.content.language || 'javascript'} 
          onValueChange={(value) => onContentUpdate('language', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="sql">SQL</SelectItem>
            <SelectItem value="bash">Bash</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  switch (block.type) {
    case 'heading':
      return renderHeadingProperties();
    case 'callout':
      return renderCalloutProperties();
    case 'number_card':
      return renderNumberCardProperties();
    case 'snapshot_card':
      return renderSnapshotCardProperties();
    case 'poll':
      return renderPollProperties();
    case 'figure':
      return renderFigureProperties();
    case 'list':
      return renderListProperties();
    case 'code':
      return renderCodeProperties();
    default:
      return (
        <div className="text-xs" style={{ color: '#6b7280' }}>
          Nenhuma propriedade específica disponível para este tipo de bloco.
        </div>
      );
  }
};
