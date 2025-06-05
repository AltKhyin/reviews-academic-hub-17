
// ABOUTME: Live preview component for native reviews
// Shows how the review will look to readers in real-time

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, Users } from 'lucide-react';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '../review/BlockRenderer';
import { cn } from '@/lib/utils';

interface ReviewPreviewProps {
  blocks: ReviewBlock[];
  className?: string;
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = ({
  blocks,
  className
}) => {
  const estimatedReadingTime = Math.max(1, Math.ceil(blocks.length * 0.5)); // Rough estimate

  return (
    <div className={cn("review-preview", className)}>
      {/* Preview Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Visualização</h2>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~{estimatedReadingTime} min</span>
            </div>
            <Badge variant="outline">
              {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <Eye className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum Conteúdo para Visualizar
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Adicione blocos usando a paleta à esquerda para ver a visualização do seu conteúdo aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="relative group">
              {/* Block Indicator */}
              <div className="absolute -left-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              
              {/* Block Content */}
              <div className="transition-all duration-200 group-hover:bg-blue-50/30 group-hover:rounded-lg group-hover:p-2 group-hover:-m-2">
                <BlockRenderer 
                  block={block} 
                  readonly={true}
                  onInteraction={() => {}} // No interactions in preview
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Footer */}
      {blocks.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>Esta é uma visualização de como os leitores verão o conteúdo</span>
          </div>
        </div>
      )}
    </div>
  );
};
