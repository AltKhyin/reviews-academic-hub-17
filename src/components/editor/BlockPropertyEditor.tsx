
// ABOUTME: Comprehensive block property editor with type-specific controls
// Provides detailed editing interface for all block types and properties

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Type, 
  Palette, 
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({
  block,
  onUpdate
}) => {
  const updatePayload = (field: string, value: any) => {
    onUpdate({
      payload: {
        ...block.payload,
        [field]: value
      }
    });
  };

  const updateMeta = (field: string, value: any) => {
    onUpdate({
      meta: {
        ...block.meta,
        [field]: value
      }
    });
  };

  const renderBasicProperties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label style={{ color: '#ffffff' }}>Visibilidade</Label>
        <div className="flex items-center gap-2">
          {block.visible ? (
            <Eye className="w-4 h-4" style={{ color: '#10b981' }} />
          ) : (
            <EyeOff className="w-4 h-4" style={{ color: '#ef4444' }} />
          )}
          <Switch
            checked={block.visible}
            onCheckedChange={(checked) => onUpdate({ visible: checked })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="block-id" style={{ color: '#ffffff' }}>ID do Bloco</Label>
        <Input
          id="block-id"
          value={block.id}
          disabled
          className="mt-1"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
        />
      </div>

      <div>
        <Label htmlFor="block-type" style={{ color: '#ffffff' }}>Tipo</Label>
        <Input
          id="block-type"
          value={block.type}
          disabled
          className="mt-1"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
        />
      </div>
    </div>
  );

  const renderTypeSpecificProperties = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="heading-text" style={{ color: '#ffffff' }}>Texto do Título</Label>
              <Input
                id="heading-text"
                value={block.payload.text || ''}
                onChange={(e) => updatePayload('text', e.target.value)}
                placeholder="Digite o título"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label htmlFor="heading-level" style={{ color: '#ffffff' }}>Nível do Título</Label>
              <Select 
                value={String(block.payload.level || 2)} 
                onValueChange={(value) => updatePayload('level', Number(value))}
              >
                <SelectTrigger 
                  className="mt-1"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="1">H1 - Título Principal</SelectItem>
                  <SelectItem value="2">H2 - Título de Seção</SelectItem>
                  <SelectItem value="3">H3 - Subtítulo</SelectItem>
                  <SelectItem value="4">H4 - Título Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="heading-anchor" style={{ color: '#ffffff' }}>Âncora (opcional)</Label>
              <Input
                id="heading-anchor"
                value={block.payload.anchor || ''}
                onChange={(e) => updatePayload('anchor', e.target.value)}
                placeholder="ancora-do-titulo"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <Label style={{ color: '#ffffff' }}>Alinhamento</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                  { value: 'center', icon: AlignCenter, label: 'Centro' },
                  { value: 'right', icon: AlignRight, label: 'Direita' }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={block.payload.alignment === value ? "default" : "outline"}
                    onClick={() => updatePayload('alignment', value)}
                    className="flex items-center gap-2"
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label style={{ color: '#ffffff' }}>Ênfase</Label>
              <Select 
                value={block.payload.emphasis || 'normal'} 
                onValueChange={(value) => updatePayload('emphasis', value)}
              >
                <SelectTrigger 
                  className="mt-1"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lead">Lead (destaque)</SelectItem>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="caption">Legenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'callout':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="callout-title" style={{ color: '#ffffff' }}>Título</Label>
              <Input
                id="callout-title"
                value={block.payload.title || ''}
                onChange={(e) => updatePayload('title', e.target.value)}
                placeholder="Título do destaque"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: '#ffffff' }}>Tipo de Destaque</Label>
              <Select 
                value={block.payload.type || 'info'} 
                onValueChange={(value) => updatePayload('type', value)}
              >
                <SelectTrigger 
                  className="mt-1"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="callout-content" style={{ color: '#ffffff' }}>Conteúdo</Label>
              <Textarea
                id="callout-content"
                value={block.payload.content || ''}
                onChange={(e) => updatePayload('content', e.target.value)}
                placeholder="Conteúdo do destaque"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        );

      case 'figure':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="figure-src" style={{ color: '#ffffff' }}>URL da Imagem</Label>
              <Input
                id="figure-src"
                value={block.payload.src || ''}
                onChange={(e) => updatePayload('src', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label htmlFor="figure-alt" style={{ color: '#ffffff' }}>Texto Alternativo</Label>
              <Input
                id="figure-alt"
                value={block.payload.alt || ''}
                onChange={(e) => updatePayload('alt', e.target.value)}
                placeholder="Descrição da imagem"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label htmlFor="figure-caption" style={{ color: '#ffffff' }}>Legenda</Label>
              <Textarea
                id="figure-caption"
                value={block.payload.caption || ''}
                onChange={(e) => updatePayload('caption', e.target.value)}
                placeholder="Legenda da imagem"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <div>
              <Label style={{ color: '#ffffff' }}>Alinhamento</Label>
              <Select 
                value={block.payload.alignment || 'center'} 
                onValueChange={(value) => updatePayload('alignment', value)}
              >
                <SelectTrigger 
                  className="mt-1"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8" style={{ color: '#9ca3af' }}>
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>Propriedades específicas para este tipo de bloco</p>
            <p className="text-sm">serão implementadas em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="block-property-editor space-y-6">
      {/* Basic Properties */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Layout className="w-4 h-4" />
            Propriedades Básicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderBasicProperties()}
        </CardContent>
      </Card>

      {/* Type-Specific Properties */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Type className="w-4 h-4" />
            Propriedades do {block.type}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTypeSpecificProperties()}
        </CardContent>
      </Card>

      {/* Styling Properties */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Palette className="w-4 h-4" />
            Estilo e Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-css" style={{ color: '#ffffff' }}>Classes CSS Customizadas</Label>
              <Input
                id="custom-css"
                value={block.meta?.className || ''}
                onChange={(e) => updateMeta('className', e.target.value)}
                placeholder="minha-classe personalizada"
                className="mt-1"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
