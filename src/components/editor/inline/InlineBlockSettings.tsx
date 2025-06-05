
// ABOUTME: Enhanced inline block settings with comprehensive block-specific properties
// Provides detailed configuration for all block types with proper dark theme styling

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Eye, EyeOff, Palette, Type, AlignLeft } from 'lucide-react';
import { InlineColorPicker } from './InlineColorPicker';
import { InlineAlignmentControls } from './InlineAlignmentControls';
import { cn } from '@/lib/utils';

interface InlineBlockSettingsProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  className?: string;
}

export const InlineBlockSettings: React.FC<InlineBlockSettingsProps> = ({
  block,
  onUpdate,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!onUpdate) return null;

  const handlePayloadUpdate = (field: string, value: any) => {
    onUpdate({
      payload: {
        ...block.payload,
        [field]: value
      }
    });
  };

  const handleColorChange = (colorType: string, color: string) => {
    onUpdate({
      payload: {
        ...block.payload,
        [colorType]: color
      }
    });
  };

  const handleAlignmentChange = (alignment: 'top' | 'center' | 'bottom') => {
    onUpdate({
      meta: {
        ...block.meta,
        alignment: {
          ...block.meta?.alignment,
          vertical: alignment
        }
      }
    });
  };

  const handleVisibilityToggle = () => {
    onUpdate({ visible: !block.visible });
  };

  // Block-specific properties
  const renderBlockSpecificProperties = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Nível</Label>
              <Select 
                value={String(block.payload.level || 1)} 
                onValueChange={(value) => handlePayloadUpdate('level', parseInt(value))}
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
                value={block.payload.anchor || ''}
                onChange={(e) => handlePayloadUpdate('anchor', e.target.value)}
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
                value={block.payload.alignment || 'left'} 
                onValueChange={(value) => handlePayloadUpdate('alignment', value)}
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
                value={block.payload.emphasis || 'normal'} 
                onValueChange={(value) => handlePayloadUpdate('emphasis', value)}
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
                value={block.payload.width || 'auto'}
                onChange={(e) => handlePayloadUpdate('width', e.target.value)}
                placeholder="auto, 100%, 500px"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#d1d5db' }}>Alinhamento</Label>
              <Select 
                value={block.payload.alignment || 'center'} 
                onValueChange={(value) => handlePayloadUpdate('alignment', value)}
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
                value={block.payload.type || 'info'} 
                onValueChange={(value) => handlePayloadUpdate('type', value)}
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
                value={block.payload.trend || 'neutral'} 
                onValueChange={(value) => handlePayloadUpdate('trend', value)}
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
            {block.payload.trend !== 'neutral' && (
              <div className="space-y-2">
                <Label style={{ color: '#d1d5db' }}>Porcentagem</Label>
                <Input
                  type="number"
                  value={block.payload.percentage || 0}
                  onChange={(e) => handlePayloadUpdate('percentage', Number(e.target.value))}
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
                checked={block.payload.compact || false}
                onCheckedChange={(checked) => handlePayloadUpdate('compact', checked)}
              />
              <Label style={{ color: '#d1d5db' }}>Compacta</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={block.payload.sortable || false}
                onCheckedChange={(checked) => handlePayloadUpdate('sortable', checked)}
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
                value={block.payload.poll_type || 'single_choice'} 
                onValueChange={(value) => handlePayloadUpdate('poll_type', value)}
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
                checked={block.payload.show_results || true}
                onCheckedChange={(checked) => handlePayloadUpdate('show_results', checked)}
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

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity", className)}
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        title="Configurações do bloco"
      >
        <Settings className="w-3 h-3" style={{ color: '#ffffff' }} />
      </Button>
    );
  }

  return (
    <div 
      className={cn("inline-block-settings rounded-lg p-3 min-w-80 max-w-sm", className)}
      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium" style={{ color: '#ffffff' }}>
          Configurações do Bloco
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
          style={{ color: '#ffffff' }}
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList 
          className="grid w-full grid-cols-3 mb-4"
          style={{ backgroundColor: '#212121' }}
        >
          <TabsTrigger 
            value="general"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            style={{ color: '#ffffff' }}
          >
            <Type className="w-3 h-3 mr-1" />
            Geral
          </TabsTrigger>
          <TabsTrigger 
            value="alignment"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            style={{ color: '#ffffff' }}
          >
            <AlignLeft className="w-3 h-3 mr-1" />
            Alinhamento
          </TabsTrigger>
          <TabsTrigger 
            value="colors"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            style={{ color: '#ffffff' }}
          >
            <Palette className="w-3 h-3 mr-1" />
            Cores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-3">
          <div className="flex items-center justify-between">
            <Label style={{ color: '#d1d5db' }}>Bloco Visível</Label>
            <div className="flex items-center gap-2">
              {block.visible ? (
                <Eye className="w-3 h-3" style={{ color: '#10b981' }} />
              ) : (
                <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />
              )}
              <Switch
                checked={block.visible}
                onCheckedChange={handleVisibilityToggle}
                className="scale-75"
              />
            </div>
          </div>
          
          <div className="text-xs" style={{ color: '#6b7280' }}>
            ID: {block.id} • Tipo: {block.type}
          </div>

          {renderBlockSpecificProperties()}
        </TabsContent>

        <TabsContent value="alignment" className="space-y-3">
          <InlineAlignmentControls
            alignment={block.meta?.alignment?.vertical || 'top'}
            onAlignmentChange={handleAlignmentChange}
          />
          <div className="text-xs" style={{ color: '#6b7280' }}>
            Controla o alinhamento vertical do conteúdo em grids com alturas diferentes.
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-3">
          <div className="space-y-2">
            <InlineColorPicker
              label="Texto"
              value={block.payload.text_color || '#ffffff'}
              onChange={(color) => handleColorChange('text_color', color)}
              readonly={false}
              compact={true}
            />
            <InlineColorPicker
              label="Fundo"
              value={block.payload.background_color || 'transparent'}
              onChange={(color) => handleColorChange('background_color', color)}
              readonly={false}
              compact={true}
            />
            <InlineColorPicker
              label="Borda"
              value={block.payload.border_color || 'transparent'}
              onChange={(color) => handleColorChange('border_color', color)}
              readonly={false}
              compact={true}
            />
            {(block.type === 'snapshot_card' || block.type === 'callout' || block.type === 'number_card') && (
              <InlineColorPicker
                label="Destaque"
                value={block.payload.accent_color || '#3b82f6'}
                onChange={(color) => handleColorChange('accent_color', color)}
                readonly={false}
                compact={true}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
