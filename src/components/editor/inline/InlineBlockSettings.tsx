
// ABOUTME: Simplified inline block settings with extracted components
// Main settings interface for blocks with modular property panels

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Eye, EyeOff, Palette, Type, AlignLeft } from 'lucide-react';
import { InlineColorPicker } from './InlineColorPicker';
import { InlineAlignmentControls } from './InlineAlignmentControls';
import { BlockSpecificProperties } from './BlockSpecificProperties';
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

  const handleContentUpdate = (field: string, value: any) => {
    onUpdate({
      content: {
        ...block.content,
        [field]: value
      }
    });
  };

  const handleColorChange = (colorType: string, color: string) => {
    onUpdate({
      content: {
        ...block.content,
        [colorType]: color
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
        className={cn("h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity", className)}
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', position: 'fixed', zIndex: 1070 }}
        title="Configurações do bloco"
      >
        <Settings className="w-3 h-3" style={{ color: '#ffffff' }} />
      </Button>
    );
  }

  return (
    <div 
      className={cn("inline-block-settings rounded-lg p-3 min-w-80 max-w-sm", className)}
      style={{ 
        backgroundColor: '#1a1a1a', 
        border: '1px solid #2a2a2a',
        position: 'fixed',
        zIndex: 1070
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium" style={{ color: '#ffffff' }}>
          Configurações do Bloco
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 p-0"
          style={{ color: '#ffffff' }}
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList 
          className="grid w-full grid-cols-3 mb-4"
          style={{ backgroundColor: '#212121' }}
        >
          <TabsTrigger 
            value="general"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            style={{ color: '#ffffff' }}
          >
            <Type className="w-3 h-3 mr-1" />
            Geral
          </TabsTrigger>
          <TabsTrigger 
            value="alignment"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            style={{ color: '#ffffff' }}
          >
            <AlignLeft className="w-3 h-3 mr-1" />
            Alinhamento
          </TabsTrigger>
          <TabsTrigger 
            value="colors"
            className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            style={{ color: '#ffffff' }}
          >
            <Palette className="w-3 h-3 mr-1" />
            Cores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-3">
          <div className="flex items-center justify-between">
            <Label style={{ color: '#d1d5db' }}>Bloco Visível</Label>
            <div className="flex items-center gap-2">
              {block.visible ? (
                <Eye className="w-3 h-3" style={{ color: '#10b981' }} />
              ) : (
                <EyeOff className="w-3 h-3" style={{ color: '#ef4444' }} />
              )}
              <Switch
                checked={block.visible}
                onCheckedChange={handleVisibilityToggle}
                className="scale-75"
              />
            </div>
          </div>
          
          <div className="text-xs" style={{ color: '#6b7280' }}>
            ID: {block.id} • Tipo: {block.type}
          </div>

          <BlockSpecificProperties 
            block={block}
            onContentUpdate={handleContentUpdate}
          />
        </TabsContent>

        <TabsContent value="alignment" className="space-y-3">
          <InlineAlignmentControls
            alignment={block.meta?.alignment?.vertical || 'top'}
            onAlignmentChange={handleAlignmentChange}
          />
          <div className="text-xs" style={{ color: '#6b7280' }}>
            Controla o alinhamento vertical do conteúdo em grids com alturas diferentes.
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-3">
          <div className="space-y-2">
            <InlineColorPicker
              label="Texto"
              value={block.content.text_color || '#ffffff'}
              onChange={(color) => handleColorChange('text_color', color)}
              readonly={false}
              compact={true}
            />
            <InlineColorPicker
              label="Fundo"
              value={block.content.background_color || 'transparent'}
              onChange={(color) => handleColorChange('background_color', color)}
              readonly={false}
              compact={true}
            />
            <InlineColorPicker
              label="Borda"
              value={block.content.border_color || 'transparent'}
              onChange={(color) => handleColorChange('border_color', color)}
              readonly={false}
              compact={true}
            />
            {(block.type === 'snapshot_card' || block.type === 'callout' || block.type === 'number_card') && (
              <InlineColorPicker
                label="Destaque"
                value={block.content.accent_color || '#3b82f6'}
                onChange={(color) => handleColorChange('accent_color', color)}
                readonly={false}
                compact={true}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
