
// ABOUTME: Preview component for native review content
// Shows real-time preview of how the review will look to readers

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className={cn("review-preview bg-gray-900", className)}>
        <Card className="m-6 border-dashed border-gray-600 bg-gray-800">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhum conteúdo para visualizar
            </h3>
            <p className="text-gray-400">
              Adicione blocos ao editor para ver uma prévia do conteúdo aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("review-preview bg-gray-900 overflow-y-auto", className)}>
      {/* Preview Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 z-10">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Visualização
          </h3>
          <span className="text-sm text-gray-400">
            ({visibleBlocks.length} {visibleBlocks.length === 1 ? 'bloco' : 'blocos'})
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content max-w-4xl mx-auto px-6 py-8">
        {visibleBlocks.map((block) => (
          <div 
            key={block.id} 
            className="preview-block mb-8"
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
      <div className="border-t border-gray-700 px-6 py-4 bg-gray-800">
        <div className="text-center text-sm text-gray-400">
          <p>Fim da visualização • {visibleBlocks.length} blocos renderizados</p>
        </div>
      </div>
    </div>
  );
};
