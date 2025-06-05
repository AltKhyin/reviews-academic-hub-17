
// ABOUTME: Enhanced inline block settings with vertical alignment support
// Comprehensive settings panel for all block types with tabbed interface

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { InlineColorPicker } from './InlineColorPicker';
import { InlineAlignmentControls } from './InlineAlignmentControls';
import { cn } from '@/lib/utils';

interface InlineBlockSettingsProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  className?: string;
}

export const InlineBlockSettings: React.FC<InlineBlockSettingsProps> = ({
  block,
  onUpdate,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!onUpdate) return null;

  const handleColorChange = (colorType: string, color: string) => {
    onUpdate({
      payload: {
        ...block.payload,
        [`${colorType}_color`]: color
      }
    });
  };

  const handleAlignmentChange = (alignment: 'top' | 'center' | 'bottom') => {
    onUpdate({
      meta: {
        ...block.meta,
        alignment: {
          ...block.meta?.alignment,
          vertical: alignment
        }
      }
    });
  };

  const handleVisibilityToggle = () => {
    onUpdate({ visible: !block.visible });
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("h-6 w-6 p-0 bg-gray-800 border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity", className)}
        title="Configurações do bloco"
      >
        <Settings className="w-3 h-3" />
      </Button>
    );
  }

  return (
    <div className={cn("inline-block-settings bg-gray-900 border border-gray-600 rounded-lg p-3 min-w-80", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">Configurações do Bloco</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="alignment">Alinhamento</TabsTrigger>
          <TabsTrigger value="colors">Cores</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVisibilityToggle}
              className="flex items-center gap-2"
            >
              {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {block.visible ? "Visível" : "Oculto"}
            </Button>
          </div>
          
          <div className="text-xs text-gray-400">
            Tipo: {block.type} • ID: {block.id}
          </div>
        </TabsContent>

        <TabsContent value="alignment" className="mt-3 space-y-3">
          <InlineAlignmentControls
            alignment={block.meta?.alignment?.vertical || 'top'}
            onAlignmentChange={handleAlignmentChange}
          />
          <div className="text-xs text-gray-400">
            Controla o alinhamento vertical do conteúdo em grids com alturas diferentes.
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-3 space-y-3">
          <div className="space-y-2">
            <InlineColorPicker
              label="Texto"
              value={block.payload.text_color || '#ffffff'}
              onChange={(color) => handleColorChange('text', color)}
            />
            <InlineColorPicker
              label="Fundo"
              value={block.payload.background_color || 'transparent'}
              onChange={(color) => handleColorChange('background', color)}
            />
            <InlineColorPicker
              label="Borda"
              value={block.payload.border_color || 'transparent'}
              onChange={(color) => handleColorChange('border', color)}
            />
            {(block.type === 'snapshot_card' || block.type === 'callout') && (
              <InlineColorPicker
                label="Destaque"
                value={block.payload.accent_color || '#3b82f6'}
                onChange={(color) => handleColorChange('accent', color)}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
