
// ABOUTME: Enhanced callout block with inline editing and multiple types
// Provides highlighted content boxes with direct editing capabilities

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineRichTextEditor } from '@/components/editor/inline/InlineRichTextEditor';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

interface CalloutBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload;
  const type = payload.type || 'info';
  const title = payload.title || '';
  const content = payload.content || '';

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({
        payload: {
          ...payload,
          [field]: value
        }
      });
    }
  };

  const getCalloutConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          icon: AlertTriangle,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          iconColor: '#f59e0b',
          title: 'Atenção'
        };
      case 'success':
        return {
          icon: CheckCircle,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          iconColor: '#10b981',
          title: 'Sucesso'
        };
      case 'error':
        return {
          icon: XCircle,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          iconColor: '#ef4444',
          title: 'Erro'
        };
      case 'note':
        return {
          icon: FileText,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          iconColor: '#8b5cf6',
          title: 'Nota'
        };
      case 'tip':
        return {
          icon: Lightbulb,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          iconColor: '#06b6d4',
          title: 'Dica'
        };
      default: // info
        return {
          icon: Info,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          iconColor: '#3b82f6',
          title: 'Informação'
        };
    }
  };

  const config = getCalloutConfig(type);
  const Icon = config.icon;
  const displayTitle = title || config.title;

  if (readonly) {
    return (
      <div className="callout-block my-6">
        <Card 
          className="border-l-4 shadow-lg"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            borderLeftColor: config.borderColor
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: config.backgroundColor }}
              >
                <Icon 
                  className="w-5 h-5" 
                  style={{ color: config.iconColor }}
                />
              </div>
              <h4 
                className="font-semibold text-lg"
                style={{ color: '#ffffff' }}
              >
                {displayTitle}
              </h4>
            </div>
          </CardHeader>
          
          <CardContent>
            <div 
              className="prose prose-invert max-w-none"
              style={{ color: '#d1d5db' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="callout-block my-6">
      <Card 
        className="border-l-4 shadow-lg"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a',
          borderLeftColor: config.borderColor
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: config.backgroundColor }}
            >
              <Icon 
                className="w-5 h-5" 
                style={{ color: config.iconColor }}
              />
            </div>
            
            <div className="flex-1 space-y-2">
              {/* Type Selector */}
              <Select 
                value={type} 
                onValueChange={(value) => handleUpdate('type', value)}
              >
                <SelectTrigger 
                  className="w-40"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="note">Nota</SelectItem>
                  <SelectItem value="tip">Dica</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Title Editor */}
              <InlineTextEditor
                value={title}
                onChange={(value) => handleUpdate('title', value)}
                placeholder={config.title}
                className="font-semibold text-lg"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <InlineRichTextEditor
            value={content}
            onChange={(value) => handleUpdate('content', value)}
            placeholder="Conteúdo do destaque..."
            className="prose prose-invert max-w-none"
          />
        </CardContent>
      </Card>
    </div>
  );
};
