
// ABOUTME: Enhanced figure block with caption support and responsive images
// Displays images, charts, and other media with proper accessibility

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { Image, FileText } from 'lucide-react';

interface FigureBlockProps {
  block: ReviewBlock;
  readonly?: boolean;
}

export const FigureBlock: React.FC<FigureBlockProps> = ({ 
  block, 
  readonly = false 
}) => {
  const payload = block.payload;
  const src = payload.src || '';
  const alt = payload.alt || '';
  const caption = payload.caption || '';
  const width = payload.width || 'auto';
  const alignment = payload.alignment || 'center';

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
              {!readonly && (
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
              )}
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
};
