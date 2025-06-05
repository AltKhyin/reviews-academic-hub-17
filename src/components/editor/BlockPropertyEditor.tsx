
// ABOUTME: Property editor for individual blocks
// Provides form controls for editing block-specific properties

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ReviewBlock, SnapshotCardPayload, HeadingPayload, ParagraphPayload, FigurePayload, TablePayload, CalloutPayload, NumberCardPayload, ReviewerQuotePayload } from '@/types/review';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({
  block,
  onUpdate
}) => {
  const updatePayload = (updates: Partial<any>) => {
    onUpdate({
      payload: { ...block.payload, ...updates }
    });
  };

  const updateMeta = (updates: Partial<any>) => {
    onUpdate({
      meta: { ...block.meta, ...updates }
    });
  };

  const renderSnapshotCardEditor = () => {
    const payload = block.payload as SnapshotCardPayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="population">População</Label>
          <Textarea
            id="population"
            value={payload.population || ''}
            onChange={(e) => updatePayload({ population: e.target.value })}
            placeholder="Descreva a população do estudo..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="intervention">Intervenção</Label>
          <Textarea
            id="intervention"
            value={payload.intervention || ''}
            onChange={(e) => updatePayload({ intervention: e.target.value })}
            placeholder="Descreva a intervenção..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="comparison">Comparação</Label>
          <Textarea
            id="comparison"
            value={payload.comparison || ''}
            onChange={(e) => updatePayload({ comparison: e.target.value })}
            placeholder="Descreva o grupo controle..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="outcome">Desfecho</Label>
          <Textarea
            id="outcome"
            value={payload.outcome || ''}
            onChange={(e) => updatePayload({ outcome: e.target.value })}
            placeholder="Descreva o desfecho primário..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="design">Desenho do Estudo</Label>
          <Input
            id="design"
            value={payload.design || ''}
            onChange={(e) => updatePayload({ design: e.target.value })}
            placeholder="Ex: Ensaio clínico randomizado"
          />
        </div>
        
        <div>
          <Label htmlFor="evidence_level">Nível de Evidência</Label>
          <Select 
            value={payload.evidence_level || 'moderate'} 
            onValueChange={(value) => updatePayload({ evidence_level: value })}
          >
            <SelectTrigger>
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
          <Label htmlFor="recommendation_strength">Força da Recomendação</Label>
          <Select 
            value={payload.recommendation_strength || 'conditional'} 
            onValueChange={(value) => updatePayload({ recommendation_strength: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strong">Forte</SelectItem>
              <SelectItem value="conditional">Condicional</SelectItem>
              <SelectItem value="expert_opinion">Opinião de Especialista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="key_findings">Principais Achados</Label>
          <Textarea
            id="key_findings"
            value={Array.isArray(payload.key_findings) ? payload.key_findings.join('\n') : ''}
            onChange={(e) => updatePayload({ 
              key_findings: e.target.value.split('\n').filter(line => line.trim())
            })}
            placeholder="Um achado por linha..."
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Digite um achado por linha
          </p>
        </div>
      </div>
    );
  };

  const renderHeadingEditor = () => {
    const payload = block.payload as HeadingPayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="text">Texto do Título</Label>
          <Input
            id="text"
            value={payload.text || ''}
            onChange={(e) => updatePayload({ text: e.target.value })}
            placeholder="Digite o título da seção..."
          />
        </div>
        
        <div>
          <Label htmlFor="level">Nível do Título</Label>
          <Select 
            value={payload.level?.toString() || '2'} 
            onValueChange={(value) => updatePayload({ level: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 - Título Principal</SelectItem>
              <SelectItem value="2">H2 - Seção</SelectItem>
              <SelectItem value="3">H3 - Subseção</SelectItem>
              <SelectItem value="4">H4 - Sub-subseção</SelectItem>
              <SelectItem value="5">H5 - Parágrafo</SelectItem>
              <SelectItem value="6">H6 - Detalhe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={payload.slug || ''}
            onChange={(e) => updatePayload({ slug: e.target.value })}
            placeholder="url-amigavel"
          />
        </div>
      </div>
    );
  };

  const renderParagraphEditor = () => {
    const payload = block.payload as ParagraphPayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            value={payload.content || ''}
            onChange={(e) => updatePayload({ content: e.target.value })}
            placeholder="Digite o conteúdo do parágrafo..."
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Suporte básico para HTML
          </p>
        </div>
      </div>
    );
  };

  const renderFigureEditor = () => {
    const payload = block.payload as FigurePayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="image_url">URL da Imagem</Label>
          <Input
            id="image_url"
            value={payload.image_url || ''}
            onChange={(e) => updatePayload({ image_url: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>
        
        <div>
          <Label htmlFor="caption">Legenda</Label>
          <Textarea
            id="caption"
            value={payload.caption || ''}
            onChange={(e) => updatePayload({ caption: e.target.value })}
            placeholder="Descrição da figura..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="alt_text">Texto Alternativo</Label>
          <Input
            id="alt_text"
            value={payload.alt_text || ''}
            onChange={(e) => updatePayload({ alt_text: e.target.value })}
            placeholder="Descrição para acessibilidade..."
          />
        </div>
        
        <div>
          <Label htmlFor="figure_number">Número da Figura</Label>
          <Input
            id="figure_number"
            type="number"
            value={payload.figure_number || ''}
            onChange={(e) => updatePayload({ figure_number: parseInt(e.target.value) || null })}
            placeholder="1"
          />
        </div>
      </div>
    );
  };

  const renderCalloutEditor = () => {
    const payload = block.payload as CalloutPayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="callout_type">Tipo de Destaque</Label>
          <Select 
            value={payload.type || 'info'} 
            onValueChange={(value) => updatePayload({ type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Informação</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="note">Nota</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="title">Título (Opcional)</Label>
          <Input
            id="title"
            value={payload.title || ''}
            onChange={(e) => updatePayload({ title: e.target.value })}
            placeholder="Título do destaque..."
          />
        </div>
        
        <div>
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            value={payload.content || ''}
            onChange={(e) => updatePayload({ content: e.target.value })}
            placeholder="Conteúdo do destaque..."
            rows={4}
          />
        </div>
      </div>
    );
  };

  const renderNumberCardEditor = () => {
    const payload = block.payload as NumberCardPayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            value={payload.number || ''}
            onChange={(e) => updatePayload({ number: e.target.value })}
            placeholder="42"
          />
        </div>
        
        <div>
          <Label htmlFor="label">Rótulo</Label>
          <Input
            id="label"
            value={payload.label || ''}
            onChange={(e) => updatePayload({ label: e.target.value })}
            placeholder="Pacientes"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={payload.description || ''}
            onChange={(e) => updatePayload({ description: e.target.value })}
            placeholder="Descrição adicional..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="trend">Tendência</Label>
          <Select 
            value={payload.trend || 'neutral'} 
            onValueChange={(value) => updatePayload({ trend: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="up">Crescimento</SelectItem>
              <SelectItem value="down">Declínio</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'snapshot_card':
        return renderSnapshotCardEditor();
      case 'heading':
        return renderHeadingEditor();
      case 'paragraph':
        return renderParagraphEditor();
      case 'figure':
        return renderFigureEditor();
      case 'callout':
        return renderCalloutEditor();
      case 'number_card':
        return renderNumberCardEditor();
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            Editor não implementado para o tipo: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Block Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Informações do Bloco</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="block_id">ID do Bloco</Label>
            <Input
              id="block_id"
              value={block.id}
              disabled
              className="text-xs font-mono"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="visible">Visível</Label>
            <Switch
              id="visible"
              checked={block.visible}
              onCheckedChange={(checked) => onUpdate({ visible: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Block-specific Editor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Propriedades do Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          {renderEditor()}
        </CardContent>
      </Card>
    </div>
  );
};
