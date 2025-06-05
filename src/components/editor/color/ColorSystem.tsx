// ABOUTME: Centralized color management system for all block types
// Provides comprehensive color editing with current color preservation

import React from 'react';
import { ColorPicker } from '@/components/ui/color-picker';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ReviewBlock } from '@/types/review';

interface ColorSystemProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
}

// Default colors for different block types
const DEFAULT_COLORS = {
  text: '#ffffff',
  background: 'transparent',
  border: '#2a2a2a',
  accent: '#3b82f6',
  heading: '#ffffff',
  paragraph: '#d1d5db',
  callout: {
    info: { bg: '#1e3a8a', border: '#3b82f6', text: '#bfdbfe' },
    warning: { bg: '#92400e', border: '#f59e0b', text: '#fde68a' },
    success: { bg: '#14532d', border: '#22c55e', text: '#bbf7d0' },
    error: { bg: '#991b1b', border: '#ef4444', text: '#fecaca' },
    note: { bg: '#374151', border: '#6b7280', text: '#d1d5db' },
    tip: { bg: '#065f46', border: '#10b981', text: '#a7f3d0' }
  }
};

export const ColorSystem: React.FC<ColorSystemProps> = ({ block, onUpdate }) => {
  const content = block.content || {};
  const meta = block.meta || {};

  const handleColorUpdate = (colorType: string, value: string) => {
    onUpdate({
      content: {
        ...content,
        [`${colorType}_color`]: value
      }
    });
  };

  const getColorValue = (colorType: string, fallback: string) => {
    return content[`${colorType}_color`] || fallback;
  };

  const renderCommonColors = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <ColorPicker
          value={getColorValue('text', DEFAULT_COLORS.text)}
          onChange={(value) => handleColorUpdate('text', value)}
          label="Cor do Texto"
          description="Cor principal do texto do bloco"
        />
        
        <ColorPicker
          value={getColorValue('background', DEFAULT_COLORS.background)}
          onChange={(value) => handleColorUpdate('background', value)}
          label="Cor de Fundo"
          description="Cor de fundo do bloco"
          showAlpha={true}
        />
        
        <ColorPicker
          value={getColorValue('border', DEFAULT_COLORS.border)}
          onChange={(value) => handleColorUpdate('border', value)}
          label="Cor da Borda"
          description="Cor das bordas do bloco"
        />
      </div>
    </div>
  );

  const renderHeadingColors = () => (
    <div className="space-y-4">
      {renderCommonColors()}
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
      <ColorPicker
        value={getColorValue('heading', DEFAULT_COLORS.heading)}
        onChange={(value) => handleColorUpdate('heading', value)}
        label="Cor do Cabeçalho"
        description="Cor específica do texto do cabeçalho"
      />
      <ColorPicker
        value={getColorValue('accent', DEFAULT_COLORS.accent)}
        onChange={(value) => handleColorUpdate('accent', value)}
        label="Cor de Destaque"
        description="Cor para elementos de destaque"
      />
    </div>
  );

  const renderCalloutColors = () => {
    const calloutType = content.type || 'info';
    const defaults = DEFAULT_COLORS.callout[calloutType as keyof typeof DEFAULT_COLORS.callout] || DEFAULT_COLORS.callout.info;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <ColorPicker
            value={getColorValue('callout_background', defaults.bg)}
            onChange={(value) => handleColorUpdate('callout_background', value)}
            label="Fundo do Destaque"
            description="Cor de fundo específica do callout"
            showAlpha={true}
          />
          
          <ColorPicker
            value={getColorValue('callout_border', defaults.border)}
            onChange={(value) => handleColorUpdate('callout_border', value)}
            label="Borda do Destaque"
            description="Cor da borda do callout"
          />
          
          <ColorPicker
            value={getColorValue('callout_text', defaults.text)}
            onChange={(value) => handleColorUpdate('callout_text', value)}
            label="Texto do Destaque"
            description="Cor do texto dentro do callout"
          />
          
          <ColorPicker
            value={getColorValue('callout_icon', defaults.border)}
            onChange={(value) => handleColorUpdate('callout_icon', value)}
            label="Ícone do Destaque"
            description="Cor do ícone do callout"
          />
        </div>
      </div>
    );
  };

  const renderTableColors = () => (
    <div className="space-y-4">
      {renderCommonColors()}
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
      <div className="grid grid-cols-1 gap-4">
        <ColorPicker
          value={getColorValue('table_header_bg', '#212121')}
          onChange={(value) => handleColorUpdate('table_header_bg', value)}
          label="Fundo do Cabeçalho"
          description="Cor de fundo das células do cabeçalho"
        />
        
        <ColorPicker
          value={getColorValue('table_header_text', '#ffffff')}
          onChange={(value) => handleColorUpdate('table_header_text', value)}
          label="Texto do Cabeçalho"
          description="Cor do texto do cabeçalho"
        />
        
        <ColorPicker
          value={getColorValue('table_cell_bg', 'transparent')}
          onChange={(value) => handleColorUpdate('table_cell_bg', value)}
          label="Fundo das Células"
          description="Cor de fundo das células de dados"
          showAlpha={true}
        />
        
        <ColorPicker
          value={getColorValue('table_cell_text', '#d1d5db')}
          onChange={(value) => handleColorUpdate('table_cell_text', value)}
          label="Texto das Células"
          description="Cor do texto das células"
        />
        
        <ColorPicker
          value={getColorValue('table_border', '#2a2a2a')}
          onChange={(value) => handleColorUpdate('table_border', value)}
          label="Bordas da Tabela"
          description="Cor das bordas internas da tabela"
        />
      </div>
    </div>
  );

  const renderFigureColors = () => (
    <div className="space-y-4">
      {renderCommonColors()}
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
      <div className="grid grid-cols-1 gap-4">
        <ColorPicker
          value={getColorValue('figure_border', '#2a2a2a')}
          onChange={(value) => handleColorUpdate('figure_border', value)}
          label="Borda da Imagem"
          description="Cor da borda ao redor da imagem"
        />
        
        <ColorPicker
          value={getColorValue('caption_text', '#9ca3af')}
          onChange={(value) => handleColorUpdate('caption_text', value)}
          label="Cor da Legenda"
          description="Cor do texto da legenda"
        />
        
        <ColorPicker
          value={getColorValue('caption_bg', 'transparent')}
          onChange={(value) => handleColorUpdate('caption_bg', value)}
          label="Fundo da Legenda"
          description="Cor de fundo da legenda"
          showAlpha={true}
        />
      </div>
    </div>
  );

  const renderNumberCardColors = () => (
    <div className="space-y-4">
      {renderCommonColors()}
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
      <div className="grid grid-cols-1 gap-4">
        <ColorPicker
          value={getColorValue('number_color', '#3b82f6')}
          onChange={(value) => handleColorUpdate('number_color', value)}
          label="Cor do Número"
          description="Cor do número principal"
        />
        
        <ColorPicker
          value={getColorValue('label_color', '#d1d5db')}
          onChange={(value) => handleColorUpdate('label_color', value)}
          label="Cor do Rótulo"
          description="Cor do texto do rótulo"
        />
        
        <ColorPicker
          value={getColorValue('trend_color', '#10b981')}
          onChange={(value) => handleColorUpdate('trend_color', value)}
          label="Cor da Tendência"
          description="Cor do indicador de tendência"
        />
      </div>
    </div>
  );

  const renderQuoteColors = () => (
    <div className="space-y-4">
      {renderCommonColors()}
      <Separator style={{ backgroundColor: '#2a2a2a' }} />
      <div className="grid grid-cols-1 gap-4">
        <ColorPicker
          value={getColorValue('quote_text', '#e5e7eb')}
          onChange={(value) => handleColorUpdate('quote_text', value)}
          label="Texto da Citação"
          description="Cor do texto da citação"
        />
        
        <ColorPicker
          value={getColorValue('author_text', '#9ca3af')}
          onChange={(value) => handleColorUpdate('author_text', value)}
          label="Texto do Autor"
          description="Cor do nome do autor"
        />
        
        <ColorPicker
          value={getColorValue('institution_text', '#6b7280')}
          onChange={(value) => handleColorUpdate('institution_text', value)}
          label="Texto da Instituição"
          description="Cor do texto da instituição"
        />
        
        <ColorPicker
          value={getColorValue('quote_border', '#3b82f6')}
          onChange={(value) => handleColorUpdate('quote_border', value)}
          label="Borda da Citação"
          description="Cor da borda lateral da citação"
        />
      </div>
    </div>
  );

  const renderBlockSpecificColors = () => {
    switch (block.type) {
      case 'heading':
        return renderHeadingColors();
      case 'paragraph':
        return renderCommonColors();
      case 'callout':
        return renderCalloutColors();
      case 'table':
        return renderTableColors();
      case 'figure':
        return renderFigureColors();
      case 'number_card':
        return renderNumberCardColors();
      case 'reviewer_quote':
        return renderQuoteColors();
      case 'citation_list':
      case 'poll':
      case 'snapshot_card':
        return renderCommonColors();
      default:
        return renderCommonColors();
    }
  };

  return (
    <div className="color-system space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: DEFAULT_COLORS.accent }} />
        <Label className="text-sm font-semibold" style={{ color: '#ffffff' }}>
          Configurações de Cor
        </Label>
      </div>
      {renderBlockSpecificColors()}
    </div>
  );
};
