
// ABOUTME: Block-specific property configurations extracted from InlineBlockSettings
// Handles type-specific settings for different block types

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface BlockSpecificPropertiesProps {
  block: ReviewBlock;
  onContentUpdate: (field: string, value: any) => void;
}

export const BlockSpecificProperties: React.FC<BlockSpecificPropertiesProps> = ({
  block,
  onContentUpdate
}) => {
  const renderBlockProperties = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Nível</Label>
              <Select 
                value={String(block.content.level || 1)} 
                onValueChange={(value) => onContentUpdate('level', parseInt(value))}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                  <SelectItem value="5">H5</SelectItem>
                  <SelectItem value="6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Âncora</Label>
              <Input
                value={block.content.anchor || ''}
                onChange={(e) => onContentUpdate('anchor', e.target.value)}
                placeholder="id-do-titulo"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Alinhamento</Label>
              <Select 
                value={block.content.alignment || 'left'} 
                onValueChange={(value) => onContentUpdate('alignment', value)}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                  <SelectItem value="justify">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Ênfase</Label>
              <Select 
                value={block.content.emphasis || 'normal'} 
                onValueChange={(value) => onContentUpdate('emphasis', value)}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lead">Destaque</SelectItem>
                  <SelectItem value="small">Pequeno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'figure':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Largura</Label>
              <Input
                value={block.content.width || 'auto'}
                onChange={(e) => onContentUpdate('width', e.target.value)}
                placeholder="auto, 100%, 500px"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Alinhamento</Label>
              <Select 
                value={block.content.alignment || 'center'} 
                onValueChange={(value) => onContentUpdate('alignment', value)}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
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

      case 'callout':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Tipo</Label>
              <Select 
                value={block.content.type || 'info'} 
                onValueChange={(value) => onContentUpdate('type', value)}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="note">Nota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'number_card':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Tendência</Label>
              <Select 
                value={block.content.trend || 'neutral'} 
                onValueChange={(value) => onContentUpdate('trend', value)}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="neutral">Neutro</SelectItem>
                  <SelectItem value="up">Subindo</SelectItem>
                  <SelectItem value="down">Descendo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {block.content.trend !== 'neutral' && (
              <div className="space-y-2">
                <Label style={{ color: '#d1d5db' }}>Porcentagem</Label>
                <Input
                  type="number"
                  value={block.content.percentage || 0}
                  onChange={(e) => onContentUpdate('percentage', Number(e.target.value))}
                  className="h-8 text-xs"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                />
              </div>
            )}
          </div>
        );

      case 'table':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={block.content.compact || false}
                onCheckedChange={(checked) => onContentUpdate('compact', checked)}
              />
              <Label style={{ color: '#d1d5db' }}>Compacta</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={block.content.sortable || false}
                onCheckedChange={(checked) => onContentUpdate('sortable', checked)}
              />
              <Label style={{ color: '#d1d5db' }}>Ordenável</Label>
            </div>
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Tipo</Label>
              <Select 
                value={block.content.poll_type || 'single_choice'} 
                onValueChange={(value) => onContentUpdate('poll_type', value)}
              >
                <SelectTrigger 
                  className="h-8"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="single_choice">Escolha única</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                  <SelectItem value="rating">Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={block.content.show_results || true}
                onCheckedChange={(checked) => onContentUpdate('show_results', checked)}
              />
              <Label style={{ color: '#d1d5db' }}>Mostrar resultados</Label>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            Nenhuma propriedade específica disponível para este tipo de bloco.
          </p>
        );
    }
  };

  return renderBlockProperties();
};
