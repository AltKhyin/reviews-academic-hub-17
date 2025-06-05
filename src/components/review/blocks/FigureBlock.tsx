
// ABOUTME: Enhanced figure block with inline editing for captions and metadata
// Displays images with editable captions and accessibility features

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewBlock } from '@/types/review';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { Image, FileText, Upload } from 'lucide-react';

interface FigureBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const FigureBlock: React.FC<FigureBlockProps> = ({ 
  block, 
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload;
  const src = payload.src || '';
  const alt = payload.alt || '';
  const caption = payload.caption || '';
  const width = payload.width || 'auto';
  const alignment = payload.alignment || 'center';

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

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  if (readonly) {
    return (
      <div className={`figure-block my-6 ${getAlignmentClass(alignment)}`}>
        <Card 
          className="border shadow-md overflow-hidden"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <CardContent className="p-0">
            {src ? (
              <div className="relative">
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto object-cover"
                  style={{ maxWidth: width !== 'auto' ? width : '100%' }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center py-12 px-6"
                style={{ backgroundColor: '#212121' }}
              >
                <FileText className="w-12 h-12 mb-4" style={{ color: '#6b7280' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  Nenhuma imagem selecionada
                </p>
              </div>
            )}
            
            {caption && (
              <div className="p-4 border-t" style={{ borderColor: '#2a2a2a' }}>
                <p className="text-sm italic" style={{ color: '#d1d5db' }}>
                  {caption}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`figure-block my-6 ${getAlignmentClass(alignment)}`}>
      <Card 
        className="border shadow-md overflow-hidden"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <CardContent className="p-0">
          {src ? (
            <div className="relative">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto object-cover"
                style={{ maxWidth: width !== 'auto' ? width : '100%' }}
                loading="lazy"
              />
              <div className="absolute top-2 left-2">
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#ffffff'
                  }}
                >
                  <Image className="w-3 h-3" />
                  Figura
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed"
              style={{ 
                backgroundColor: '#212121',
                borderColor: '#2a2a2a'
              }}
            >
              <FileText className="w-12 h-12 mb-4" style={{ color: '#6b7280' }} />
              <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                Nenhuma imagem selecionada
              </p>
              
              <div className="space-y-3 w-full max-w-md">
                <Input
                  type="url"
                  value={src}
                  onChange={(e) => handleUpdate('src', e.target.value)}
                  placeholder="URL da imagem"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement file upload
                    console.log('Upload file');
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload de Arquivo
                </Button>
              </div>
            </div>
          )}
          
          {/* Image Controls */}
          {src && (
            <div className="p-4 space-y-3 border-t" style={{ borderColor: '#2a2a2a' }}>
              {/* Alt text */}
              <InlineTextEditor
                value={alt}
                onChange={(value) => handleUpdate('alt', value)}
                placeholder="Texto alternativo para acessibilidade"
                className="text-sm"
              />
              
              {/* Alignment */}
              <div className="flex items-center gap-2">
                <label className="text-sm" style={{ color: '#d1d5db' }}>
                  Alinhamento:
                </label>
                <Select 
                  value={alignment} 
                  onValueChange={(value) => handleUpdate('alignment', value)}
                >
                  <SelectTrigger 
                    className="w-32"
                    style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
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
              
              {/* Width */}
              <div className="flex items-center gap-2">
                <label className="text-sm" style={{ color: '#d1d5db' }}>
                  Largura:
                </label>
                <Input
                  type="text"
                  value={width}
                  onChange={(e) => handleUpdate('width', e.target.value)}
                  placeholder="auto, 100%, 500px"
                  className="w-32"
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a',
                    color: '#ffffff'
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Caption */}
          <div className="p-4 border-t" style={{ borderColor: '#2a2a2a' }}>
            <InlineTextEditor
              value={caption}
              onChange={(value) => handleUpdate('caption', value)}
              placeholder="Legenda da figura (opcional)"
              className="text-sm italic"
              multiline
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
