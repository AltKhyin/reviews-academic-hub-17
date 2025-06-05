
// ABOUTME: Enhanced callout block with comprehensive inline settings and color integration  
// Handles contextual information display with icons and customizable styling

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { InlineBlockSettings } from '@/components/editor/inline/InlineBlockSettings';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Lightbulb 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

const calloutTypes = {
  info: { icon: Info, label: 'Informação', defaultColor: '#3b82f6' },
  warning: { icon: AlertTriangle, label: 'Aviso', defaultColor: '#f59e0b' },
  success: { icon: CheckCircle, label: 'Sucesso', defaultColor: '#10b981' },
  error: { icon: XCircle, label: 'Erro', defaultColor: '#ef4444' },
  note: { icon: FileText, label: 'Nota', defaultColor: '#8b5cf6' },
  tip: { icon: Lightbulb, label: 'Dica', defaultColor: '#06b6d4' }
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload;
  const type = payload.type || 'info';
  const title = payload.title || '';
  const content = payload.content || '';
  
  // Color system integration
  const textColor = payload.text_color || '#ffffff';
  const backgroundColor = payload.background_color || 'rgba(59, 130, 246, 0.1)';
  const borderColor = payload.border_color || '#3b82f6';
  const accentColor = payload.accent_color || calloutTypes[type]?.defaultColor || '#3b82f6';

  const handleFieldChange = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const handleTypeChange = (newType: string) => {
    if (onUpdate) {
      const defaultColor = calloutTypes[newType]?.defaultColor || '#3b82f6';
      onUpdate({
        payload: {
          ...payload,
          type: newType,
          accent_color: defaultColor,
          border_color: defaultColor,
          background_color: `${defaultColor}1a` // 10% opacity
        }
      });
    }
  };

  const IconComponent = calloutTypes[type]?.icon || Info;

  const containerStyle: React.CSSProperties = {
    color: textColor,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderLeftWidth: '4px',
    borderLeftColor: accentColor
  };

  const iconStyle: React.CSSProperties = {
    color: accentColor
  };

  if (readonly) {
    return (
      <div className="callout-block my-6">
        <div 
          className="rounded-lg p-4 flex gap-3"
          style={containerStyle}
        >
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent className="w-5 h-5" style={iconStyle} />
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-semibold mb-2" style={{ color: textColor }}>
                {title}
              </div>
            )}
            {content && (
              <div 
                className="prose prose-sm max-w-none"
                style={{ color: textColor }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
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

      <div 
        className="rounded-lg p-4"
        style={containerStyle}
      >
        {/* Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: textColor }}>
            Tipo de Callout:
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded border"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderColor: borderColor,
              color: textColor
            }}
          >
            {Object.entries(calloutTypes).map(([key, config]) => (
              <option key={key} value={key} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent className="w-5 h-5" style={iconStyle} />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title Editor */}
            <InlineTextEditor
              value={title}
              onChange={(value) => handleFieldChange('title', value)}
              placeholder="Título do callout (opcional)"
              className="font-semibold"
              disabled={readonly}
              style={{
                color: textColor,
                fontSize: '1rem',
                fontWeight: '600'
              }}
            />

            {/* Content Editor */}
            <InlineRichTextEditor
              value={content}
              onChange={(value) => handleFieldChange('content', value)}
              placeholder="Conteúdo do callout..."
              disabled={readonly}
              className="prose prose-sm max-w-none"
              style={{
                color: textColor,
                minHeight: '60px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
