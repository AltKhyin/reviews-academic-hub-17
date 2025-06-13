
// ABOUTME: Live preview component with real-time updates for block editing
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
  className = ""
}) => {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [highlightActiveBlock, setHighlightActiveBlock] = useState(true);

  // Update timestamp when blocks change
  useEffect(() => {
    setLastUpdate(new Date());
  }, [blocks]);

  // Filter visible blocks and sort by index
  const visibleBlocks = useMemo(() => {
    return blocks
      .filter(block => block.visible)
      .sort((a, b) => a.sort_index - b.sort_index);
  }, [blocks]);

  // Create wrapper function for onUpdate
  const createBlockUpdateWrapper = (blockId: string) => {
    return (updates: Partial<ReviewBlock>) => {
      if (onBlockUpdate) {
        onBlockUpdate(blockId, updates);
      }
    };
  };

  const getViewportClasses = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const getViewportIcon = () => {
    switch (viewportSize) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className={cn("live-preview h-full flex flex-col", className)}>
      {/* Preview Controls */}
      <div 
        className="flex items-center justify-between p-3 border-b flex-shrink-0"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4" style={{ color: '#10b981' }} />
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Preview ao Vivo
          </span>
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {visibleBlocks.length} blocos
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Size Controls */}
          <div className="flex items-center border rounded-md" style={{ borderColor: '#2a2a2a' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewportSize('mobile')}
              className={cn(
                "h-8 w-8 p-0 rounded-r-none",
                viewportSize === 'mobile' && "bg-blue-600 text-white"
              )}
              title="Mobile View"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewportSize('tablet')}
              className={cn(
                "h-8 w-8 p-0 rounded-none border-x",
                viewportSize === 'tablet' && "bg-blue-600 text-white"
              )}
              style={{ borderColor: '#2a2a2a' }}
              title="Tablet View"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewportSize('desktop')}
              className={cn(
                "h-8 w-8 p-0 rounded-l-none",
                viewportSize === 'desktop' && "bg-blue-600 text-white"
              )}
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            title="Refresh Preview"
            style={{ color: '#9ca3af' }}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div 
        className="flex-1 overflow-y-auto p-6"
        style={{ backgroundColor: '#121212' }}
      >
        <div className={cn("transition-all duration-200", getViewportClasses())}>
          {visibleBlocks.length === 0 ? (
            <Card 
              className="border-2 border-dashed text-center py-16"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a'
              }}
            >
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <Eye className="w-8 h-8" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>
                      Preview Vazio
                    </h3>
                    <p className="text-sm" style={{ color: '#9ca3af' }}>
                      Adicione blocos no editor para ver o preview aqui
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {visibleBlocks.map((block) => (
                <div
                  key={block.id}
                  className={cn(
                    "transition-all duration-200",
                    highlightActiveBlock && activeBlockId === block.id && 
                    "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 rounded-lg"
                  )}
                >
                  <BlockRenderer
                    block={block}
                    onUpdate={createBlockUpdateWrapper(block.id)}
                    readonly={true}
                    className="preview-block"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div 
        className="flex items-center justify-between p-3 border-t text-xs flex-shrink-0"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a',
          color: '#9ca3af'
        }}
      >
        <div className="flex items-center gap-2">
          {getViewportIcon()}
          <span>Visualização {viewportSize}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHighlightActiveBlock(!highlightActiveBlock)}
            className="h-6 px-2 text-xs"
            style={{ color: highlightActiveBlock ? '#3b82f6' : '#9ca3af' }}
          >
            {highlightActiveBlock ? 'Highlight ON' : 'Highlight OFF'}
          </Button>
        </div>
      </div>
    </div>
  );
};
