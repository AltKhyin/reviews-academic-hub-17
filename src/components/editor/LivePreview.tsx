
// ABOUTME: Live preview component with real-time updates for block editing and string ID support
// Provides immediate visual feedback during content creation

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewBlock } from '@/types/review';
import { BlockRenderer } from '@/components/review/BlockRenderer';
import { Eye, RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  blocks: ReviewBlock[];
  activeBlockId?: string | null;
  onBlockUpdate?: (blockId: string, updates: Partial<ReviewBlock>) => void;
  className?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export const LivePreview: React.FC<LivePreviewProps> = ({
  blocks,
  activeBlockId,
  onBlockUpdate,
  className
}) => {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHiddenBlocks, setShowHiddenBlocks] = useState(false);

  // Memoize filtered blocks for performance
  const visibleBlocks = useMemo(() => {
    return showHiddenBlocks 
      ? blocks 
      : blocks.filter(block => block.visible !== false);
  }, [blocks, showHiddenBlocks]);

  const hiddenBlocksCount = blocks.length - blocks.filter(block => block.visible !== false).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<ReviewBlock>) => {
    if (onBlockUpdate) {
      onBlockUpdate(blockId, updates);
    }
  };

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', maxWidth: '100%' };
      case 'tablet':
        return { width: '768px', maxWidth: '100%' };
      default:
        return { width: '100%', maxWidth: '100%' };
    }
  };

  const viewportDimensions = getViewportDimensions();

  return (
    <Card className={cn("h-full flex flex-col", className)} style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Eye className="w-5 h-5" />
            Live Preview
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Viewport Size Toggle */}
            <div className="flex border rounded overflow-hidden" style={{ borderColor: '#2a2a2a' }}>
              <Button
                variant={viewportSize === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewportSize('desktop')}
                className="rounded-none border-0"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={viewportSize === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewportSize('tablet')}
                className="rounded-none border-0"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={viewportSize === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewportSize('mobile')}
                className="rounded-none border-0"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            {/* Hidden Blocks Toggle */}
            {hiddenBlocksCount > 0 && (
              <Button
                variant={showHiddenBlocks ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowHiddenBlocks(!showHiddenBlocks)}
                className="text-xs"
              >
                {showHiddenBlocks ? 'Ocultar' : `Mostrar ${hiddenBlocksCount}`} ocultos
              </Button>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        {/* Viewport Info */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Badge variant="outline" className="text-xs">
            {viewportSize === 'desktop' ? 'Desktop' : viewportSize === 'tablet' ? 'Tablet' : 'Mobile'}
          </Badge>
          <span>•</span>
          <span>{visibleBlocks.length} blocos visíveis</span>
          {activeBlockId && (
            <>
              <span>•</span>
              <span>Ativo: {activeBlockId}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div 
          className="h-full overflow-auto mx-auto transition-all duration-300"
          style={viewportDimensions}
        >
          <div className="p-6 space-y-4" style={{ backgroundColor: '#121212' }}>
            {visibleBlocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">Nenhum bloco para visualizar</div>
                <div className="text-sm text-gray-500">
                  Adicione blocos no editor para ver a prévia
                </div>
              </div>
            ) : (
              visibleBlocks.map((block) => {
                const isActive = activeBlockId === block.id;
                
                return (
                  <div
                    key={block.id}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      isActive && "ring-2 ring-blue-500 ring-opacity-50",
                      !block.visible && "opacity-50 border border-dashed border-gray-600"
                    )}
                    style={{
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    {!block.visible && (
                      <div className="text-xs text-gray-500 mb-2 px-2">
                        Bloco oculto - ID: {block.id}
                      </div>
                    )}
                    <BlockRenderer
                      block={block}
                      onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                      readonly={true}
                    />
                  </div>
                );
              })
            )}
            
            {/* End Indicator */}
            <div className="text-center py-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">Fim da prévia</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
