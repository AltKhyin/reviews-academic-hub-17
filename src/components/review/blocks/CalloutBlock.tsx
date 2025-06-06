
// ABOUTME: Enhanced callout block with comprehensive inline settings and color integration  
// Handles contextual information display with full type selection and customization

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Lightbulb,
  Zap,
  Heart,
  Star,
  BookOpen,
  Shield,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

const calloutTypes = {
  info: { icon: Info, label: 'Informação', defaultColor: '#3b82f6', bgOpacity: '1a' },
  warning: { icon: AlertTriangle, label: 'Aviso', defaultColor: '#f59e0b', bgOpacity: '1a' },
  success: { icon: CheckCircle, label: 'Sucesso', defaultColor: '#10b981', bgOpacity: '1a' },
  error: { icon: XCircle, label: 'Erro', defaultColor: '#ef4444', bgOpacity: '1a' },
  note: { icon: FileText, label: 'Nota', defaultColor: '#8b5cf6', bgOpacity: '1a' },
  tip: { icon: Lightbulb, label: 'Dica', defaultColor: '#06b6d4', bgOpacity: '1a' },
  important: { icon: Zap, label: 'Importante', defaultColor: '#f97316', bgOpacity: '1a' },
  recommendation: { icon: Heart, label: 'Recomendação', defaultColor: '#ec4899', bgOpacity: '1a' },
  highlight: { icon: Star, label: 'Destaque', defaultColor: '#eab308', bgOpacity: '1a' },
  study: { icon: BookOpen, label: 'Estudo', defaultColor: '#6366f1', bgOpacity: '1a' },
  safety: { icon: Shield, label: 'Segurança', defaultColor: '#059669', bgOpacity: '1a' },
  timeline: { icon: Clock, label: 'Cronograma', defaultColor: '#7c3aed', bgOpacity: '1a' }
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const content = block.content;
  const type = content.type || 'info';
  const title = content.title || '';
  const contentText = content.content || '';
  const showIcon = content.show_icon !== false;
  const borderStyle = content.border_style || 'left'; // left, full, none
  const size = content.size || 'normal'; // compact, normal, large
  
  // Color system integration
  const textColor = content.text_color || '#ffffff';
  const backgroundColor = content.background_color || `${calloutTypes[type]?.defaultColor}${calloutTypes[type]?.bgOpacity}`;
  const borderColor = content.border_color || calloutTypes[type]?.defaultColor;
  const accentColor = content.accent_color || calloutTypes[type]?.defaultColor || '#3b82f6';
  const titleColor = content.title_color || textColor;

  const handleFieldChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        content: {
          ...content,
          [field]: value
        }
      });
    }
  };

  const handleTypeChange = (newType: string) => {
    if (onUpdate) {
      const defaultColor = calloutTypes[newType]?.defaultColor || '#3b82f6';
      const bgOpacity = calloutTypes[newType]?.bgOpacity || '1a';
      onUpdate({
        content: {
          ...content,
          type: newType,
          accent_color: defaultColor,
          border_color: defaultColor,
          background_color: `${defaultColor}${bgOpacity}`
        }
      });
    }
  };

  const IconComponent = calloutTypes[type]?.icon || Info;

  const getContainerClasses = () => {
    const base = "rounded-lg transition-all duration-200";
    const sizeClasses = {
      compact: "p-3",
      normal: "p-4",
      large: "p-6"
    };
    const borderClasses = {
      left: "border-l-4",
      full: "border",
      none: ""
    };
    
    return cn(base, sizeClasses[size], borderClasses[borderStyle]);
  };

  const containerStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: borderStyle === 'full' ? '1px' : borderStyle === 'left' ? '0 0 0 4px' : '0',
    borderStyle: 'solid'
  };

  const iconStyle: React.CSSProperties = {
    color: accentColor
  };

  const getIconSize = () => {
    const sizes = {
      compact: "w-4 h-4",
      normal: "w-5 h-5", 
      large: "w-6 h-6"
    };
    return sizes[size];
  };

  const getTitleSize = () => {
    const sizes = {
      compact: "text-sm font-medium",
      normal: "text-base font-semibold",
      large: "text-lg font-bold"
    };
    return sizes[size];
  };

  const getContentSize = () => {
    const sizes = {
      compact: "text-xs",
      normal: "text-sm", 
      large: "text-base"
    };
    return sizes[size];
  };

  if (readonly) {
    return (
      <div className="callout-block my-6">
        <div 
          className={getContainerClasses()}
          style={containerStyle}
        >
          <div className="flex gap-3">
            {showIcon && (
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent className={getIconSize()} style={iconStyle} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <div className={cn(getTitleSize(), "mb-2")} style={{ color: titleColor }}>
                  {title}
                </div>
              )}
              {contentText && (
                <div 
                  className={cn("prose max-w-none", getContentSize())}
                  style={{ color: textColor }}
                  dangerouslySetInnerHTML={{ __html: contentText }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="callout-block my-6 group relative">
      {/* Inline Settings */}
      <div className="absolute -top-2 -right-2 z-10">
        <InlineBlockSettings
          block={block}
          onUpdate={onUpdate}
        />
      </div>

      <div className="space-y-4">
        {/* Callout Configuration Panel */}
        <div 
          className="p-4 rounded border space-y-4"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderColor: '#2a2a2a'
          }}
        >
          {/* Type and Style Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Tipo de Callout
              </Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  {Object.entries(calloutTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" style={{ color: config.defaultColor }} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Estilo da Borda
              </Label>
              <Select value={borderStyle} onValueChange={(value) => handleFieldChange('border_style', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="left">Borda Esquerda</SelectItem>
                  <SelectItem value="full">Borda Completa</SelectItem>
                  <SelectItem value="none">Sem Borda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium mb-2 block" style={{ color: textColor }}>
                Tamanho
              </Label>
              <Select value={size} onValueChange={(value) => handleFieldChange('size', value)}>
                <SelectTrigger 
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: textColor }}
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

          {/* Icon Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-icon"
              checked={showIcon}
              onCheckedChange={(checked) => handleFieldChange('show_icon', checked)}
            />
            <Label htmlFor="show-icon" className="text-xs" style={{ color: textColor }}>
              Mostrar ícone
            </Label>
          </div>
        </div>

        {/* Callout Content */}
        <div 
          className={getContainerClasses()}
          style={containerStyle}
        >
          <div className="flex gap-3">
            {showIcon && (
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent className={getIconSize()} style={iconStyle} />
              </div>
            )}
            
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title Editor */}
              <InlineTextEditor
                value={title}
                onChange={(value) => handleFieldChange('title', value)}
                placeholder="Título do callout (opcional)"
                className={getTitleSize()}
                style={{ color: titleColor }}
              />

              {/* Content Editor */}
              <InlineRichTextEditor
                value={contentText}
                onChange={(value) => handleFieldChange('content', value)}
                placeholder="Conteúdo do callout..."
                className={cn("prose max-w-none", getContentSize())}
                style={{
                  color: textColor,
                  minHeight: size === 'compact' ? '40px' : size === 'large' ? '80px' : '60px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
