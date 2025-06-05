
// ABOUTME: Enhanced block property editor with improved UX and dark theme styling
// Provides comprehensive editing interface for all block types

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ReviewBlock } from '@/types/review';
import { Settings, Eye, EyeOff, Trash2 } from 'lucide-react';

interface BlockPropertyEditorProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
  onDelete?: () => void;
}

export const BlockPropertyEditor: React.FC<BlockPropertyEditorProps> = ({
  block,
  onUpdate,
  onDelete
}) => {
  const updatePayload = (updates: any) => {
    onUpdate({
      payload: { ...block.payload, ...updates }
    });
  };

  const updateMeta = (updates: any) => {
    onUpdate({
      meta: { ...block.meta, ...updates }
    });
  };

  const renderBlockSpecificFields = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="heading-text" style={{ color: '#ffffff' }}>Texto do Título</Label>
              <Input
                id="heading-text"
                value={block.payload.text || ''}
                onChange={(e) => updatePayload({ text: e.target.value })}
                placeholder="Digite o título..."
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="heading-level" style={{ color: '#ffffff' }}>Nível do Título</Label>
              <Select 
                value={block.payload.level?.toString() || '1'} 
                onValueChange={(value) => updatePayload({ level: parseInt(value) })}
              >
                <SelectTrigger 
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <SelectItem key={level} value={level.toString()} style={{ color: '#ffffff' }}>
                      H{level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="heading-anchor" style={{ color: '#ffffff' }}>ID da Âncora (opcional)</Label>
              <Input
                id="heading-anchor"
                value={block.payload.anchor || ''}
                onChange={(e) => updatePayload({ anchor: e.target.value })}
                placeholder="id-da-secao"
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paragraph-content" style={{ color: '#ffffff' }}>Conteúdo</Label>
              <Textarea
                id="paragraph-content"
                value={block.payload.content || ''}
                onChange={(e) => updatePayload({ content: e.target.value })}
                placeholder="Digite o conteúdo do parágrafo..."
                rows={6}
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="paragraph-alignment" style={{ color: '#ffffff' }}>Alinhamento</Label>
              <Select 
                value={block.payload.alignment || 'left'} 
                onValueChange={(value) => updatePayload({ alignment: value })}
              >
                <SelectTrigger 
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="left" style={{ color: '#ffffff' }}>Esquerda</SelectItem>
                  <SelectItem value="center" style={{ color: '#ffffff' }}>Centro</SelectItem>
                  <SelectItem value="right" style={{ color: '#ffffff' }}>Direita</SelectItem>
                  <SelectItem value="justify" style={{ color: '#ffffff' }}>Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="paragraph-emphasis" style={{ color: '#ffffff' }}>Ênfase</Label>
              <Select 
                value={block.payload.emphasis || 'normal'} 
                onValueChange={(value) => updatePayload({ emphasis: value })}
              >
                <SelectTrigger 
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="normal" style={{ color: '#ffffff' }}>Normal</SelectItem>
                  <SelectItem value="lead" style={{ color: '#ffffff' }}>Destaque</SelectItem>
                  <SelectItem value="small" style={{ color: '#ffffff' }}>Pequeno</SelectItem>
                  <SelectItem value="caption" style={{ color: '#ffffff' }}>Legenda</SelectItem>
                </SelectContent>
              </Select>
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
                onChange={(e) => updatePayload({ src: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="figure-alt" style={{ color: '#ffffff' }}>Texto Alternativo</Label>
              <Input
                id="figure-alt"
                value={block.payload.alt || ''}
                onChange={(e) => updatePayload({ alt: e.target.value })}
                placeholder="Descrição da imagem para acessibilidade"
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="figure-caption" style={{ color: '#ffffff' }}>Legenda</Label>
              <Textarea
                id="figure-caption"
                value={block.payload.caption || ''}
                onChange={(e) => updatePayload({ caption: e.target.value })}
                placeholder="Legenda da figura..."
                rows={3}
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="figure-alignment" style={{ color: '#ffffff' }}>Alinhamento</Label>
              <Select 
                value={block.payload.alignment || 'center'} 
                onValueChange={(value) => updatePayload({ alignment: value })}
              >
                <SelectTrigger 
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="left" style={{ color: '#ffffff' }}>Esquerda</SelectItem>
                  <SelectItem value="center" style={{ color: '#ffffff' }}>Centro</SelectItem>
                  <SelectItem value="right" style={{ color: '#ffffff' }}>Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'callout':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="callout-type" style={{ color: '#ffffff' }}>Tipo de Callout</Label>
              <Select 
                value={block.payload.type || 'info'} 
                onValueChange={(value) => updatePayload({ type: value })}
              >
                <SelectTrigger 
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="info" style={{ color: '#ffffff' }}>Informação</SelectItem>
                  <SelectItem value="warning" style={{ color: '#ffffff' }}>Aviso</SelectItem>
                  <SelectItem value="error" style={{ color: '#ffffff' }}>Erro</SelectItem>
                  <SelectItem value="success" style={{ color: '#ffffff' }}>Sucesso</SelectItem>
                  <SelectItem value="tip" style={{ color: '#ffffff' }}>Dica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="callout-title" style={{ color: '#ffffff' }}>Título (opcional)</Label>
              <Input
                id="callout-title"
                value={block.payload.title || ''}
                onChange={(e) => updatePayload({ title: e.target.value })}
                placeholder="Título do callout..."
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="callout-content" style={{ color: '#ffffff' }}>Conteúdo</Label>
              <Textarea
                id="callout-content"
                value={block.payload.content || ''}
                onChange={(e) => updatePayload({ content: e.target.value })}
                placeholder="Conteúdo do callout..."
                rows={4}
                style={{ 
                  backgroundColor: '#212121',
                  borderColor: '#2a2a2a',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p style={{ color: '#9ca3af' }}>
              Editor específico para o tipo "{block.type}" ainda não implementado.
            </p>
          </div>
        );
    }
  };

  return (
    <Card 
      className="block-property-editor"
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#ffffff' }}>
            <Settings className="w-5 h-5" />
            Propriedades
          </CardTitle>
          <Badge 
            variant="outline"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: '#6b7280',
              color: '#9ca3af'
            }}
          >
            {block.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Common Properties */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="block-visible" style={{ color: '#ffffff' }}>
              Visível
            </Label>
            <div className="flex items-center gap-2">
              {block.visible ? (
                <Eye className="w-4 h-4" style={{ color: '#10b981' }} />
              ) : (
                <EyeOff className="w-4 h-4" style={{ color: '#ef4444' }} />
              )}
              <Switch
                id="block-visible"
                checked={block.visible}
                onCheckedChange={(checked) => onUpdate({ visible: checked })}
              />
            </div>
          </div>
        </div>

        {/* Block-specific Properties */}
        <div className="border-t pt-6" style={{ borderColor: '#2a2a2a' }}>
          <h4 className="text-sm font-medium mb-4" style={{ color: '#ffffff' }}>
            Configurações Específicas
          </h4>
          {renderBlockSpecificFields()}
        </div>

        {/* Actions */}
        {onDelete && (
          <div className="border-t pt-6" style={{ borderColor: '#2a2a2a' }}>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Bloco
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
