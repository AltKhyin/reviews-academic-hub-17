
// ABOUTME: Property editor for block configuration and customization
// Provides type-specific editing interfaces for all block types

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock } from '@/types/review';
import { RichTextEditor } from './RichTextEditor';
import { Settings, Eye, EyeOff } from 'lucide-react';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({ block, onUpdate }) => {
  const updatePayload = (key: string, value: any) => {
    onUpdate({
      payload: {
        ...block.payload,
        [key]: value
      }
    });
  };

  const updateMeta = (key: string, value: any) => {
    onUpdate({
      meta: {
        ...block.meta,
        [key]: value
      }
    });
  };

  const toggleVisibility = () => {
    onUpdate({ visible: !block.visible });
  };

  const renderTypeSpecificEditor = () => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Conteúdo</Label>
              <RichTextEditor
                value={block.payload.content || ''}
                onChange={(content) => updatePayload('content', content)}
                placeholder="Digite o conteúdo do parágrafo..."
                className="mt-2"
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Citações</Label>
              <Textarea
                value={block.payload.citations?.join(', ') || ''}
                onChange={(e) => updatePayload('citations', e.target.value.split(', ').filter(Boolean))}
                placeholder="Chaves de citação separadas por vírgula"
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Texto do Título</Label>
              <Input
                value={block.payload.text || ''}
                onChange={(e) => updatePayload('text', e.target.value)}
                placeholder="Digite o título..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Nível do Título</Label>
              <Select value={block.payload.level?.toString() || '2'} onValueChange={(value) => updatePayload('level', parseInt(value))}>
                <SelectTrigger className="mt-2" style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)'
                }}>
                  <SelectItem value="1">H1 - Título Principal</SelectItem>
                  <SelectItem value="2">H2 - Seção</SelectItem>
                  <SelectItem value="3">H3 - Subseção</SelectItem>
                  <SelectItem value="4">H4 - Tópico</SelectItem>
                  <SelectItem value="5">H5 - Subtópico</SelectItem>
                  <SelectItem value="6">H6 - Detalhe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>ID da Âncora</Label>
              <Input
                value={block.payload.anchor_id || ''}
                onChange={(e) => updatePayload('anchor_id', e.target.value)}
                placeholder="id-da-secao (opcional)"
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
          </div>
        );

      case 'snapshot_card':
        return (
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>População (P)</Label>
              <Input
                value={block.payload.population || ''}
                onChange={(e) => updatePayload('population', e.target.value)}
                placeholder="Descreva a população estudada..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Intervenção (I)</Label>
              <Input
                value={block.payload.intervention || ''}
                onChange={(e) => updatePayload('intervention', e.target.value)}
                placeholder="Descreva a intervenção..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Comparação (C)</Label>
              <Input
                value={block.payload.comparison || ''}
                onChange={(e) => updatePayload('comparison', e.target.value)}
                placeholder="Grupo controle ou comparação..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Desfecho (O)</Label>
              <Input
                value={block.payload.outcome || ''}
                onChange={(e) => updatePayload('outcome', e.target.value)}
                placeholder="Resultado medido..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Desenho (D)</Label>
              <Input
                value={block.payload.design || ''}
                onChange={(e) => updatePayload('design', e.target.value)}
                placeholder="Tipo de estudo..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Nível de Evidência</Label>
              <Select value={block.payload.evidence_level || 'moderate'} onValueChange={(value) => updatePayload('evidence_level', value)}>
                <SelectTrigger className="mt-2" style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)'
                }}>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="very_low">Muito Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'figure':
        return (
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>URL da Imagem</Label>
              <Input
                value={block.payload.image_url || ''}
                onChange={(e) => updatePayload('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Legenda</Label>
              <Textarea
                value={block.payload.caption || ''}
                onChange={(e) => updatePayload('caption', e.target.value)}
                placeholder="Descrição da figura..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Texto Alternativo</Label>
              <Input
                value={block.payload.alt_text || ''}
                onChange={(e) => updatePayload('alt_text', e.target.value)}
                placeholder="Descrição para acessibilidade..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
          </div>
        );

      case 'callout':
        return (
          <div className="space-y-4">
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Tipo de Destaque</Label>
              <Select value={block.payload.type || 'info'} onValueChange={(value) => updatePayload('type', value)}>
                <SelectTrigger className="mt-2" style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)'
                }}>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Título</Label>
              <Input
                value={block.payload.title || ''}
                onChange={(e) => updatePayload('title', e.target.value)}
                placeholder="Título do destaque..."
                className="mt-2"
                style={{
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
            </div>
            <div>
              <Label style={{ color: 'var(--editor-primary-text)' }}>Conteúdo</Label>
              <RichTextEditor
                value={block.payload.content || ''}
                onChange={(content) => updatePayload('content', content)}
                placeholder="Conteúdo do destaque..."
                className="mt-2"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8" style={{ color: 'var(--editor-muted-text)' }}>
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Editor de propriedades específico para "{block.type}" será implementado em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Block Info */}
      <Card style={{
        backgroundColor: 'var(--editor-card-bg)',
        borderColor: 'var(--editor-primary-border)'
      }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: 'var(--editor-primary-text)' }}>
            <Settings className="w-4 h-4" />
            Propriedades do Bloco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" style={{
                backgroundColor: 'var(--editor-card-bg)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}>
                {block.type}
              </Badge>
              <p className="text-xs mt-1" style={{ color: 'var(--editor-muted-text)' }}>
                ID: {block.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {block.visible ? (
                <Eye className="w-4 h-4" style={{ color: 'var(--editor-success-color)' }} />
              ) : (
                <EyeOff className="w-4 h-4" style={{ color: 'var(--editor-muted-text)' }} />
              )}
              <Switch
                checked={block.visible}
                onCheckedChange={toggleVisibility}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Type-specific Editor */}
      <Card style={{
        backgroundColor: 'var(--editor-card-bg)',
        borderColor: 'var(--editor-primary-border)'
      }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm" style={{ color: 'var(--editor-primary-text)' }}>
            Configuração de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTypeSpecificEditor()}
        </CardContent>
      </Card>
    </div>
  );
};
