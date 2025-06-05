
// ABOUTME: Preview component for native review content with enhanced dark theme
// Shows real-time preview of how the review will look to readers

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewPreviewProps {
  blocks: ReviewBlock[];
  className?: string;
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = ({
  blocks,
  className
}) => {
  const visibleBlocks = blocks.filter(block => block.visible);

  if (visibleBlocks.length === 0) {
    return (
      <div className={cn("review-preview", className)} style={{ backgroundColor: '#121212' }}>
        <Card 
          className="m-6 border-dashed shadow-lg"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            color: '#ffffff'
          }}
        >
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#6b7280' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: '#ffffff' }}>
              Nenhum conteúdo para visualizar
            </h3>
            <p style={{ color: '#d1d5db' }}>
              Adicione blocos ao editor para ver uma prévia do conteúdo aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={cn("review-preview overflow-y-auto", className)}
      style={{ backgroundColor: '#121212', color: '#ffffff' }}
    >
      {/* Preview Header */}
      <div 
        className="sticky top-0 border-b px-6 py-4 z-10"
        style={{ 
          backgroundColor: '#121212',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
            Visualização
          </h3>
          <span className="text-sm" style={{ color: '#9ca3af' }}>
            ({visibleBlocks.length} {visibleBlocks.length === 1 ? 'bloco' : 'blocos'})
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content max-w-4xl mx-auto px-6 py-8">
        {visibleBlocks.map((block) => (
          <div 
            key={block.id} 
            className="preview-block mb-8 transition-all duration-200"
            data-block-type={block.type}
            data-block-id={block.id}
          >
            <BlockRenderer
              block={block}
              readonly={true}
              className="preview-block-content"
            />
          </div>
        ))}
      </div>

      {/* Preview Footer */}
      <div 
        className="border-t px-6 py-4"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="text-center text-sm" style={{ color: '#9ca3af' }}>
          <p>Fim da visualização • {visibleBlocks.length} blocos renderizados</p>
        </div>
      </div>
    </div>
  );
};
