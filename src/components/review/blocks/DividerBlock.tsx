
// ABOUTME: Divider block for visual separation and section breaks
// Supports various divider styles and interactive section tracking

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DividerBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
}

const dividerStyles = {
  solid: { label: 'Sólida', className: 'border-solid' },
  dashed: { label: 'Tracejada', className: 'border-dashed' },
  dotted: { label: 'Pontilhada', className: 'border-dotted' },
  double: { label: 'Dupla', className: 'border-double border-t-4' },
  gradient: { label: 'Gradiente', className: 'bg-gradient-to-r h-px border-0' },
  ornamental: { label: 'Ornamental', className: 'relative' }
};

const dividerSizes = {
  thin: { label: 'Fina', height: '1px' },
  normal: { label: 'Normal', height: '2px' },
  thick: { label: 'Grossa', height: '4px' },
  very_thick: { label: 'Muito Grossa', height: '8px' }
};

export const DividerBlock: React.FC<DividerBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate,
  onInteraction,
  onSectionView
}) => {
  // Safe access to content with comprehensive fallbacks
  const content = block.content || {};
  const style = content.style || 'solid';
  const size = content.size || 'normal';
  const label = content.label || '';
  const showLabel = content.show_label ?? false;
  const spacing = content.spacing || 'normal'; // compact, normal, large
  const isSection = content.is_section ?? false;
  const sectionId = content.section_id || '';

  // Color system integration
  const dividerColor = content.divider_color || '#2a2a2a';
  const labelColor = content.label_color || '#ffffff';
  const backgroundColor = content.background_color || 'transparent';
  const gradientFrom = content.gradient_from || '#3b82f6';
  const gradientTo = content.gradient_to || '#8b5cf6';

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const handleClick = () => {
    if (isSection && onSectionView) {
      onSectionView(sectionId || block.id.toString());
    }
    if (onInteraction) {
      onInteraction(block.id.toString(), 'divider_click', {
        style,
        is_section: isSection,
        section_id: sectionId
      });
    }
  };

  const getSpacingClasses = () => {
    const spacingMap = {
      compact: 'my-4',
      normal: 'my-8',
      large: 'my-12'
    };
    return spacingMap[spacing];
  };

  const renderDivider = () => {
    const baseClasses = cn(
      'w-full transition-all duration-200',
      dividerStyles[style]?.className,
      isSection && 'cursor-pointer hover:opacity-70'
    );

    const dividerStyle: React.CSSProperties = {
      borderColor: dividerColor,
      height: dividerSizes[size]?.height,
      backgroundColor: backgroundColor
    };

    if (style === 'gradient') {
      dividerStyle.background = `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`;
      dividerStyle.border = 'none';
    }

    if (style === 'ornamental') {
      return (
        <div 
          className={cn(baseClasses, 'flex items-center justify-center h-8')}
          onClick={handleClick}
          style={{ color: dividerColor }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-px" style={{ backgroundColor: dividerColor }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dividerColor }} />
            <div className="w-12 h-px" style={{ backgroundColor: dividerColor }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dividerColor }} />
            <div className="w-8 h-px" style={{ backgroundColor: dividerColor }} />
          </div>
        </div>
      );
    }

    return (
      <div 
        className={baseClasses}
        style={dividerStyle}
        onClick={handleClick}
      />
    );
  };

  if (readonly) {
    return (
      <div className={cn("divider-block", getSpacingClasses())}>
        {showLabel && label && (
          <div className="text-center mb-4">
            <Badge 
              variant="outline"
              className="px-3 py-1"
              style={{ 
                borderColor: dividerColor,
                color: labelColor,
                backgroundColor: backgroundColor
              }}
            >
              {label}
            </Badge>
          </div>
        )}
        
        {renderDivider()}
        
        {isSection && sectionId && (
          <div className="text-center mt-2">
            <span 
              className="text-xs opacity-50"
              style={{ color: labelColor }}
            >
              Seção: {sectionId}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("divider-block group relative", getSpacingClasses())}>
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div className="space-y-4">
        {/* Divider Configuration Panel */}
        <div 
          className="p-4 rounded border space-y-4"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderColor: '#2a2a2a'
          }}
        >
          {/* Style and Size Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: '#ffffff' }}>
                Estilo
              </Label>
              <Select value={style} onValueChange={(value) => handleUpdate('style', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {Object.entries(dividerStyles).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: '#ffffff' }}>
                Espessura
              </Label>
              <Select value={size} onValueChange={(value) => handleUpdate('size', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {Object.entries(dividerSizes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: '#ffffff' }}>
                Espaçamento
              </Label>
              <Select value={spacing} onValueChange={(value) => handleUpdate('spacing', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section and Label Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLabel}
                  onChange={(e) => handleUpdate('show_label', e.target.checked)}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span className="text-xs" style={{ color: '#ffffff' }}>Mostrar rótulo</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isSection}
                  onChange={(e) => handleUpdate('is_section', e.target.checked)}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span className="text-xs" style={{ color: '#ffffff' }}>Marcador de seção</span>
              </label>
            </div>

            <div className="space-y-2">
              {showLabel && (
                <InlineTextEditor
                  value={label}
                  onChange={(value) => handleUpdate('label', value)}
                  placeholder="Rótulo do divisor"
                  className="text-xs"
                  style={{ color: '#ffffff' }}
                />
              )}
              
              {isSection && (
                <InlineTextEditor
                  value={sectionId}
                  onChange={(value) => handleUpdate('section_id', value)}
                  placeholder="ID da seção"
                  className="text-xs"
                  style={{ color: '#ffffff' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Divider Preview */}
        <div className="relative">
          {showLabel && label && (
            <div className="text-center mb-4">
              <Badge 
                variant="outline"
                className="px-3 py-1"
                style={{ 
                  borderColor: dividerColor,
                  color: labelColor,
                  backgroundColor: backgroundColor
                }}
              >
                {label}
              </Badge>
            </div>
          )}
          
          {renderDivider()}
          
          {isSection && sectionId && (
            <div className="text-center mt-2">
              <span 
                className="text-xs opacity-50"
                style={{ color: labelColor }}
              >
                Seção: {sectionId}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
