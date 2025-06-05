
// ABOUTME: Property editor for individual blocks in native review editor
// Provides form controls for editing block-specific properties

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
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
      payload: { ...block.payload, ...updates },
      updated_at: new Date().toISOString()
    });
  };

  const updateMeta = (updates: Partial<any>) => {
    onUpdate({
      meta: { ...block.meta, ...updates },
      updated_at: new Date().toISOString()
    });
  };

  const renderSnapshotCardEditor = () => {
    const payload = block.payload as SnapshotCardPayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="population">População</Label>
          <Input
            id="population"
            value={payload.population || ''}
            onChange={(e) => updatePayload({ population: e.target.value })}
            placeholder="Ex: Adultos com diabetes tipo 2..."
          />
        </div>
        <div>
          <Label htmlFor="intervention">Intervenção</Label>
          <Input
            id="intervention"
            value={payload.intervention || ''}
            onChange={(e) => updatePayload({ intervention: e.target.value })}
            placeholder="Ex: Metformina 1000mg..."
          />
        </div>
        <div>
          <Label htmlFor="comparison">Comparação</Label>
          <Input
            id="comparison"
            value={payload.comparison || ''}
            onChange={(e) => updatePayload({ comparison: e.target.value })}
            placeholder="Ex: Placebo ou controle..."
          />
        </div>
        <div>
          <Label htmlFor="outcome">Desfecho</Label>
          <Input
            id="outcome"
            value={payload.outcome || ''}
            onChange={(e) => updatePayload({ outcome: e.target.value })}
            placeholder="Ex: Redução da HbA1c..."
          />
        </div>
        <div>
          <Label htmlFor="design">Desenho do Estudo</Label>
          <Input
            id="design"
            value={payload.design || ''}
            onChange={(e) => updatePayload({ design: e.target.value })}
            placeholder="Ex: RCT duplo-cego..."
          />
        </div>
        
        <div>
          <Label>Achados Principais</Label>
          <div className="space-y-2">
            {(payload.key_findings || []).map((finding, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={finding}
                  onChange={(e) => {
                    const newFindings = [...(payload.key_findings || [])];
                    newFindings[index] = e.target.value;
                    updatePayload({ key_findings: newFindings });
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newFindings = (payload.key_findings || []).filter((_, i) => i !== index);
                    updatePayload({ key_findings: newFindings });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newFindings = [...(payload.key_findings || []), ''];
                updatePayload({ key_findings: newFindings });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Achado
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="evidence-level">Nível de Evidência</Label>
          <Select
            value={payload.evidence_level || 'moderate'}
            onValueChange={(value) => updatePayload({ evidence_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="moderate">Moderado</SelectItem>
              <SelectItem value="low">Baixo</SelectItem>
              <SelectItem value="very_low">Muito Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="recommendation">Força da Recomendação</Label>
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
            placeholder="Digite o título..."
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
              <SelectItem value="4">H4 - Subsubseção</SelectItem>
              <SelectItem value="5">H5 - Menor</SelectItem>
              <SelectItem value="6">H6 - Menor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="anchor">ID da Âncora</Label>
          <Input
            id="anchor"
            value={payload.anchor_id || ''}
            onChange={(e) => updatePayload({ anchor_id: e.target.value })}
            placeholder="ex: introducao (será usado na URL)"
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
        </div>
        <div>
          <Label>Citações</Label>
          <div className="space-y-2">
            {(payload.citations || []).map((citation, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={citation}
                  onChange={(e) => {
                    const newCitations = [...(payload.citations || [])];
                    newCitations[index] = e.target.value;
                    updatePayload({ citations: newCitations });
                  }}
                  placeholder="ID da referência"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newCitations = (payload.citations || []).filter((_, i) => i !== index);
                    updatePayload({ citations: newCitations });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newCitations = [...(payload.citations || []), ''];
                updatePayload({ citations: newCitations });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Citação
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTableEditor = () => {
    const payload = block.payload as TablePayload;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="caption">Legenda da Tabela</Label>
          <Input
            id="caption"
            value={payload.caption || ''}
            onChange={(e) => updatePayload({ caption: e.target.value })}
            placeholder="Tabela 1: Descrição da tabela..."
          />
        </div>
        
        <div>
          <Label>Cabeçalhos</Label>
          <div className="space-y-2">
            {(payload.headers || []).map((header, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={header}
                  onChange={(e) => {
                    const newHeaders = [...(payload.headers || [])];
                    newHeaders[index] = e.target.value;
                    updatePayload({ headers: newHeaders });
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newHeaders = (payload.headers || []).filter((_, i) => i !== index);
                    const newRows = (payload.rows || []).map(row => row.filter((_, i) => i !== index));
                    updatePayload({ headers: newHeaders, rows: newRows });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newHeaders = [...(payload.headers || []), ''];
                const newRows = (payload.rows || []).map(row => [...row, '']);
                updatePayload({ headers: newHeaders, rows: newRows });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Coluna
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="sortable"
            checked={payload.sortable || false}
            onCheckedChange={(checked) => updatePayload({ sortable: checked })}
          />
          <Label htmlFor="sortable">Permitir ordenação</Label>
        </div>
      </div>
    );
  };

  const renderGenericEditor = () => {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Editor específico para este tipo de bloco será implementado em breve.
        </div>
        <div>
          <Label htmlFor="visible">Visível</Label>
          <Switch
            id="visible"
            checked={block.visible}
            onCheckedChange={(checked) => onUpdate({ visible: checked })}
          />
        </div>
      </div>
    );
  };

  const getEditorContent = () => {
    switch (block.type) {
      case 'snapshot_card':
        return renderSnapshotCardEditor();
      case 'heading':
        return renderHeadingEditor();
      case 'paragraph':
        return renderParagraphEditor();
      case 'table':
        return renderTableEditor();
      default:
        return renderGenericEditor();
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
          Propriedades do Bloco
          <Badge variant="outline" className="ml-2">
            {block.type.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {getEditorContent()}
        
        {/* Block Visibility */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <Switch
              id="block-visible"
              checked={block.visible}
              onCheckedChange={(checked) => onUpdate({ visible: checked })}
            />
            <Label htmlFor="block-visible" className="text-sm">
              Bloco visível
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
