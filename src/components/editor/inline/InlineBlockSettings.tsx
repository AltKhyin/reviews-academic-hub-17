
// ABOUTME: Enhanced inline block settings component with working contextual controls
// Replaces the properties panel with functional block-level configuration

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ReviewBlock } from '@/types/review';
import { InlineColorPicker } from './InlineColorPicker';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Palette,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineBlockSettingsProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
  className?: string;
}

export const InlineBlockSettings: React.FC<InlineBlockSettingsProps> = ({
  block,
  onUpdate,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'colors'>('general');
  
  const payload = block.payload;

  const handlePayloadUpdate = (field: string, value: any) => {
    console.log(`Updating ${field} to:`, value);
    onUpdate({
      payload: {
        ...payload,
        [field]: value
      }
    });
  };

  const handleVisibilityToggle = (visible: boolean) => {
    console.log('Toggling visibility to:', visible);
    onUpdate({ visible });
  };

  const handleColorChange = (colorType: string, value: string) => {
    console.log(`Setting color ${colorType} to ${value}`);
    // Map color type to correct payload field
    const colorField = `${colorType.toLowerCase().replace(/\s+/g, '_')}_color`;
    handlePayloadUpdate(colorField, value);
  };

  const getColorOptions = () => {
    const baseColors = [
      { 
        name: 'Texto', 
        value: payload.text_color || '#ffffff', 
        description: 'Cor do texto principal' 
      },
      { 
        name: 'Fundo', 
        value: payload.background_color || 'transparent', 
        description: 'Cor de fundo do bloco' 
      },
      { 
        name: 'Borda', 
        value: payload.border_color || 'transparent', 
        description: 'Cor da borda do bloco' 
      }
    ];

    // Add block-specific accent colors
    if (['snapshot_card', 'callout', 'number_card'].includes(block.type)) {
      baseColors.push({
        name: 'Destaque',
        value: payload.accent_color || '#3b82f6',
        description: 'Cor de destaque específica'
      });
    }

    return baseColors;
  };

  const renderGeneralSettings = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Nível do Título</Label>
              <Select 
                value={String(payload.level || 1)} 
                onValueChange={(value) => handlePayloadUpdate('level', parseInt(value))}
              >
                <SelectTrigger 
                  className="h-8 text-xs" 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
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
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Âncora de Navegação</Label>
              <Input
                value={payload.anchor || ''}
                onChange={(e) => handlePayloadUpdate('anchor', e.target.value)}
                placeholder="id-para-navegacao"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
              <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                Usado para links diretos (#id-para-navegacao)
              </div>
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Alinhamento do Texto</Label>
              <div className="flex gap-1 mt-1">
                {[
                  { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                  { value: 'center', icon: AlignCenter, label: 'Centro' },
                  { value: 'right', icon: AlignRight, label: 'Direita' },
                  { value: 'justify', icon: AlignJustify, label: 'Justificado' }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={payload.alignment === value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePayloadUpdate('alignment', value)}
                    className="h-8 w-8 p-0"
                    title={label}
                    style={{
                      backgroundColor: payload.alignment === value ? '#3b82f6' : 'transparent',
                      color: payload.alignment === value ? '#ffffff' : '#d1d5db'
                    }}
                  >
                    <Icon className="w-3 h-3" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Estilo do Texto</Label>
              <Select 
                value={payload.emphasis || 'normal'} 
                onValueChange={(value) => handlePayloadUpdate('emphasis', value)}
              >
                <SelectTrigger 
                  className="h-8 text-xs" 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lead">Destaque (Lead)</SelectItem>
                  <SelectItem value="small">Texto Pequeno</SelectItem>
                  <SelectItem value="caption">Legenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'figure':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>URL da Imagem</Label>
              <Input
                value={payload.src || ''}
                onChange={(e) => handlePayloadUpdate('src', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Texto Alternativo</Label>
              <Input
                value={payload.alt || ''}
                onChange={(e) => handlePayloadUpdate('alt', e.target.value)}
                placeholder="Descrição da imagem para acessibilidade"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Alinhamento</Label>
              <Select 
                value={payload.alignment || 'center'} 
                onValueChange={(value) => handlePayloadUpdate('alignment', value)}
              >
                <SelectTrigger 
                  className="h-8 text-xs" 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
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
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Tipo de Destaque</Label>
              <Select 
                value={payload.type || 'info'} 
                onValueChange={(value) => handlePayloadUpdate('type', value)}
              >
                <SelectTrigger 
                  className="h-8 text-xs" 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <SelectItem value="info">📘 Informação</SelectItem>
                  <SelectItem value="warning">⚠️ Atenção</SelectItem>
                  <SelectItem value="success">✅ Sucesso</SelectItem>
                  <SelectItem value="error">❌ Erro</SelectItem>
                  <SelectItem value="note">📝 Nota</SelectItem>
                  <SelectItem value="tip">💡 Dica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Ordenável</Label>
              <Switch
                checked={payload.sortable || false}
                onCheckedChange={(checked) => handlePayloadUpdate('sortable', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Pesquisável</Label>
              <Switch
                checked={payload.searchable || false}
                onCheckedChange={(checked) => handlePayloadUpdate('searchable', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Modo Compacto</Label>
              <Switch
                checked={payload.compact || false}
                onCheckedChange={(checked) => handlePayloadUpdate('compact', checked)}
              />
            </div>
          </div>
        );

      case 'snapshot_card':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Nível de Evidência</Label>
              <Select 
                value={payload.evidence_level || 'moderate'} 
                onValueChange={(value) => handlePayloadUpdate('evidence_level', value)}
              >
                <SelectTrigger 
                  className="h-8 text-xs" 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="very_low">Muito Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Força da Recomendação</Label>
              <Select 
                value={payload.recommendation_strength || 'conditional'} 
                onValueChange={(value) => handlePayloadUpdate('recommendation_strength', value)}
              >
                <SelectTrigger 
                  className="h-8 text-xs" 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <SelectItem value="strong">Forte</SelectItem>
                  <SelectItem value="conditional">Condicional</SelectItem>
                  <SelectItem value="against">Contra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-center py-4" style={{ color: '#9ca3af' }}>
            <Sliders className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nenhuma configuração específica disponível para este tipo de bloco.
          </div>
        );
    }
  };

  return (
    <div className={cn("inline-block-settings", className)}>
      {/* Settings Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="h-6 w-6 p-0 hover:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          backgroundColor: showSettings ? '#3b82f6' : '#1a1a1a', 
          border: '1px solid #2a2a2a' 
        }}
        title="Configurações do bloco"
      >
        <Settings className="w-3 h-3" style={{ color: showSettings ? '#ffffff' : '#9ca3af' }} />
      </Button>

      {/* Expanded Settings Panel */}
      {showSettings && (
        <Card 
          className="mt-2 animate-in slide-in-from-top-2 duration-200 z-50"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <CardContent className="p-3 space-y-3">
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {block.visible ? (
                  <Eye className="w-3 h-3" style={{ color: '#10b981' }} />
                ) : (
                  <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />
                )}
                <Label className="text-xs" style={{ color: '#d1d5db' }}>
                  Visível no Preview
                </Label>
              </div>
              <Switch
                checked={block.visible}
                onCheckedChange={handleVisibilityToggle}
                className="scale-75"
              />
            </div>

            <Separator style={{ backgroundColor: '#2a2a2a' }} />

            {/* Settings Tabs */}
            <div className="flex gap-1">
              {[
                { key: 'general', label: 'Geral', icon: Sliders },
                { key: 'colors', label: 'Cores', icon: Palette }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={activeTab === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(key as any)}
                  className="h-7 px-2 text-xs flex items-center gap-1"
                  style={{
                    backgroundColor: activeTab === key ? '#3b82f6' : 'transparent',
                    color: activeTab === key ? '#ffffff' : '#d1d5db'
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[80px]">
              {activeTab === 'general' && renderGeneralSettings()}
              
              {activeTab === 'colors' && (
                <InlineColorPicker
                  colors={getColorOptions()}
                  onChange={handleColorChange}
                  readonly={false}
                  compact={true}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
