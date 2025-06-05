
// ABOUTME: Enhanced inline block settings component with contextual controls
// Replaces the properties panel with integrated block-level configuration

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ReviewBlock } from '@/types/review';
import { InlineColorPicker } from './InlineColorPicker';
import { useInlineEditingOptimization } from '@/hooks/useInlineEditingOptimization';
import { useAccessibilityEnhancement } from '@/hooks/useAccessibilityEnhancement';
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
  
  // Performance optimization
  const { updateField, batchUpdate } = useInlineEditingOptimization({
    onUpdate: (updates) => onUpdate(updates),
    debounceMs: 300
  });

  // Accessibility enhancement
  const { elementRef, ariaAttributes, announceToScreenReader } = useAccessibilityEnhancement({
    onEscape: () => setShowSettings(false),
    ariaLabel: 'Configurações do bloco',
    ariaDescription: 'Pressione Escape para fechar'
  });
  
  const payload = block.payload;

  const handlePayloadUpdate = (field: string, value: any) => {
    console.log('Updating payload:', { blockId: block.id, field, value });
    updateField('payload', {
      ...payload,
      [field]: value
    });
  };

  const handleVisibilityToggle = (visible: boolean) => {
    console.log('Toggling visibility:', { blockId: block.id, visible });
    updateField('visible', visible, true); // Immediate update for visibility
    announceToScreenReader(`Bloco ${visible ? 'visível' : 'oculto'}`);
  };

  const handleColorChange = (colorName: string, value: string) => {
    console.log('Color changed in settings:', { blockId: block.id, colorName, value });
    
    const fieldMap: Record<string, string> = {
      'Texto': 'text_color',
      'Fundo': 'background_color',
      'Borda': 'border_color',
      'Destaque': 'accent_color',
      'Cabeçalho Fundo': 'table_header_bg',
      'Cabeçalho Texto': 'table_header_text',
      'Célula Fundo': 'table_cell_bg',
      'Célula Texto': 'table_cell_text',
      'Borda Tabela': 'table_border',
      'Número': 'number_color',
      'Rótulo': 'label_color'
    };

    const field = fieldMap[colorName] || `${colorName.toLowerCase()}_color`;
    handlePayloadUpdate(field, value);
  };

  // Memoized color options to prevent unnecessary recalculations
  const colorOptions = useMemo(() => {
    const baseColors = [
      { name: 'Texto', value: payload.text_color || '#ffffff' },
      { name: 'Fundo', value: payload.background_color || 'transparent' },
      { name: 'Borda', value: payload.border_color || 'transparent' }
    ];

    switch (block.type) {
      case 'snapshot_card':
      case 'callout':
        baseColors.push({
          name: 'Destaque',
          value: payload.accent_color || '#3b82f6'
        });
        break;
      case 'table':
        baseColors.push(
          { name: 'Cabeçalho Fundo', value: payload.table_header_bg || '#212121' },
          { name: 'Cabeçalho Texto', value: payload.table_header_text || '#ffffff' },
          { name: 'Célula Fundo', value: payload.table_cell_bg || 'transparent' },
          { name: 'Célula Texto', value: payload.table_cell_text || '#d1d5db' },
          { name: 'Borda Tabela', value: payload.table_border || '#2a2a2a' }
        );
        break;
      case 'number_card':
        baseColors.push(
          { name: 'Número', value: payload.number_color || '#3b82f6' },
          { name: 'Rótulo', value: payload.label_color || '#9ca3af' }
        );
        break;
      case 'citation_list':
        baseColors.push({
          name: 'Destaque',
          value: payload.accent_color || '#8b5cf6'
        });
        break;
    }

    return baseColors;
  }, [block.type, payload]);

  // Memoized general settings component
  const GeneralSettings = useMemo(() => {
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
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <SelectItem key={level} value={String(level)}>H{level}</SelectItem>
                  ))}
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
                    aria-label={`Alinhar ${value}`}
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
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Legenda</Label>
              <Input
                value={payload.caption || ''}
                onChange={(e) => handlePayloadUpdate('caption', e.target.value)}
                placeholder="Legenda da imagem"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Largura</Label>
              <Select 
                value={payload.width || 'auto'} 
                onValueChange={(value) => handlePayloadUpdate('width', value)}
              >
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="auto">Automática</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="25%">25%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Título</Label>
              <Input
                value={payload.title || ''}
                onChange={(e) => handlePayloadUpdate('title', e.target.value)}
                placeholder="Título da tabela"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Legenda</Label>
              <Input
                value={payload.caption || ''}
                onChange={(e) => handlePayloadUpdate('caption', e.target.value)}
                placeholder="Descrição da tabela"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={payload.sortable || false}
                onCheckedChange={(checked) => handlePayloadUpdate('sortable', checked)}
              />
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Ordenável</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={payload.compact || false}
                onCheckedChange={(checked) => handlePayloadUpdate('compact', checked)}
              />
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Modo compacto</Label>
            </div>
          </div>
        );

      case 'callout':
        return (
          <div className="space-y-3">
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
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Título</Label>
              <Input
                value={payload.title || ''}
                onChange={(e) => handlePayloadUpdate('title', e.target.value)}
                placeholder="Título do callout"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        );

      case 'number_card':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Número</Label>
              <Input
                value={payload.number || ''}
                onChange={(e) => handlePayloadUpdate('number', e.target.value)}
                placeholder="123"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Rótulo</Label>
              <Input
                value={payload.label || ''}
                onChange={(e) => handlePayloadUpdate('label', e.target.value)}
                placeholder="Descrição"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Descrição</Label>
              <Textarea
                value={payload.description || ''}
                onChange={(e) => handlePayloadUpdate('description', e.target.value)}
                placeholder="Descrição adicional"
                className="h-16 text-xs resize-none"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Tendência</Label>
              <Select 
                value={payload.trend || 'neutral'} 
                onValueChange={(value) => handlePayloadUpdate('trend', value)}
              >
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="up">↗ Crescimento</SelectItem>
                  <SelectItem value="down">↘ Declínio</SelectItem>
                  <SelectItem value="neutral">→ Neutro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'reviewer_quote':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Citação</Label>
              <Textarea
                value={payload.quote || ''}
                onChange={(e) => handlePayloadUpdate('quote', e.target.value)}
                placeholder="Texto da citação"
                className="h-20 text-xs resize-none"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Autor</Label>
              <Input
                value={payload.author || ''}
                onChange={(e) => handlePayloadUpdate('author', e.target.value)}
                placeholder="Dr. Nome Sobrenome"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Título/Especialidade</Label>
              <Input
                value={payload.title || ''}
                onChange={(e) => handlePayloadUpdate('title', e.target.value)}
                placeholder="Cardiologista"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Instituição</Label>
              <Input
                value={payload.institution || ''}
                onChange={(e) => handlePayloadUpdate('institution', e.target.value)}
                placeholder="Hospital das Clínicas"
                className="h-8 text-xs"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Pergunta</Label>
              <Textarea
                value={payload.question || ''}
                onChange={(e) => handlePayloadUpdate('question', e.target.value)}
                placeholder="Qual sua opinião sobre...?"
                className="h-16 text-xs resize-none"
                style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Tipo</Label>
              <Select 
                value={payload.poll_type || 'single_choice'} 
                onValueChange={(value) => handlePayloadUpdate('poll_type', value)}
              >
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="single_choice">Escolha única</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                  <SelectItem value="rating">Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={payload.show_results || false}
                onCheckedChange={(checked) => handlePayloadUpdate('show_results', checked)}
              />
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Mostrar resultados</Label>
            </div>
          </div>
        );

      case 'citation_list':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Estilo de Citação</Label>
              <Select 
                value={payload.citation_style || 'apa'} 
                onValueChange={(value) => handlePayloadUpdate('citation_style', value)}
              >
                <SelectTrigger className="h-8 text-xs" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="vancouver">Vancouver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={payload.numbered || false}
                onCheckedChange={(checked) => handlePayloadUpdate('numbered', checked)}
              />
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Numerado</Label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-center py-2" style={{ color: '#9ca3af' }}>
            Nenhuma configuração disponível para este tipo de bloco
          </div>
        );
    }
  }, [block.type, payload, handlePayloadUpdate]);

  return (
    <div className={cn("inline-block-settings", className)} ref={elementRef}>
      {/* Settings Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowSettings(!showSettings);
          announceToScreenReader(showSettings ? 'Configurações fechadas' : 'Configurações abertas');
        }}
        className="h-6 w-6 p-0 hover:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: showSettings ? '#3b82f6' : '#1a1a1a', border: '1px solid #2a2a2a' }}
        title="Configurações do bloco"
        {...ariaAttributes}
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
                aria-label="Alternar visibilidade do bloco"
              />
            </div>

            <Separator style={{ backgroundColor: '#2a2a2a' }} />

            {/* Settings Tabs */}
            <div className="flex gap-1" role="tablist">
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
                  role="tab"
                  aria-selected={activeTab === key}
                  aria-label={`Aba ${label}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[80px]" role="tabpanel">
              {activeTab === 'general' && GeneralSettings}
              
              {activeTab === 'colors' && (
                <InlineColorPicker
                  colors={colorOptions}
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
