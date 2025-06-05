
// ABOUTME: Enhanced inline block settings component with contextual controls
// Replaces the properties panel with integrated block-level configuration

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
  ChevronDown, 
  ChevronUp,
  Palette,
  Sliders,
  Type,
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
  const [activeTab, setActiveTab] = useState<'general' | 'style' | 'colors'>('general');
  
  const payload = block.payload;

  const handlePayloadUpdate = (field: string, value: any) => {
    onUpdate({
      payload: {
        ...payload,
        [field]: value
      }
    });
  };

  const handleVisibilityToggle = (visible: boolean) => {
    onUpdate({ visible });
  };

  const handleColorChange = (colorType: string, value: string) => {
    handlePayloadUpdate(`${colorType}_color`, value);
  };

  const getColorOptions = () => {
    const baseColors = [
      { name: 'Texto', value: payload.text_color || '#ffffff', description: 'Cor do texto' },
      { name: 'Fundo', value: payload.background_color || 'transparent', description: 'Cor de fundo' },
      { name: 'Borda', value: payload.border_color || 'transparent', description: 'Cor da borda' }
    ];

    // Add block-specific colors
    if (block.type === 'snapshot_card') {
      baseColors.push({
        name: 'Destaque',
        value: payload.accent_color || '#3b82f6',
        description: 'Cor de destaque'
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
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Nível</Label>
              <Select 
                value={String(payload.level || 1)} 
                onValueChange={(value) => handlePayloadUpdate('level', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
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
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Âncora</Label>
              <Input
                value={payload.anchor || ''}
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
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Alinhamento</Label>
              <div className="flex gap-1 mt-1">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                  { value: 'justify', icon: AlignJustify }
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={payload.alignment === value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePayloadUpdate('alignment', value)}
                    className="h-8 w-8 p-0"
                  >
                    <Icon className="w-3 h-3" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Ênfase</Label>
              <Select 
                value={payload.emphasis || 'normal'} 
                onValueChange={(value) => handlePayloadUpdate('emphasis', value)}
              >
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lead">Destaque</SelectItem>
                  <SelectItem value="small">Pequeno</SelectItem>
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
                placeholder="https://..."
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Texto Alt</Label>
              <Input
                value={payload.alt || ''}
                onChange={(e) => handlePayloadUpdate('alt', e.target.value)}
                placeholder="Descrição"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        );

      case 'callout':
        return (
          <div>
            <Label className="text-xs" style={{ color: '#d1d5db' }}>Tipo</Label>
            <Select 
              value={payload.type || 'info'} 
              onValueChange={(value) => handlePayloadUpdate('type', value)}
            >
              <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="note">Nota</SelectItem>
                <SelectItem value="tip">Dica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return (
          <div className="text-xs text-center py-2" style={{ color: '#9ca3af' }}>
            Nenhuma configuração disponível
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
        style={{ backgroundColor: showSettings ? '#3b82f6' : '#1a1a1a', border: '1px solid #2a2a2a' }}
        title="Configurações do bloco"
      >
        <Settings className="w-3 h-3" style={{ color: showSettings ? '#ffffff' : '#9ca3af' }} />
      </Button>

      {/* Expanded Settings Panel */}
      {showSettings && (
        <Card 
          className="mt-2 animate-in slide-in-from-top-2 duration-200"
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
                  Visível
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
