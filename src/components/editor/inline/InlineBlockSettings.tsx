// ABOUTME: Refactored inline block settings with centered popup positioning and spacing controls
// Main settings interface using focused sub-components with proper modal-style positioning

import React, { useState, useRef, useEffect } from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Type, AlignLeft, Palette, Move } from 'lucide-react';
import { InlineAlignmentControls } from './InlineAlignmentControls';
import { GeneralSettings } from './settings/GeneralSettings';
import { ColorSettings } from './settings/ColorSettings';
import { SpacingControls } from './settings/SpacingControls';
import { cn } from '@/lib/utils';

interface InlineBlockSettingsProps {
  block: ReviewBlock;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
}

export const InlineBlockSettings: React.FC<InlineBlockSettingsProps> = ({
  block,
  onUpdate,
  className,
  containerRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!onUpdate) return null;

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
          "absolute top-2 right-2 z-20",
          className
        )}
        style={{ 
          backgroundColor: '#1a1a1a', 
          borderColor: '#2a2a2a'
        }}
        title="Configurações do bloco"
      >
        <Settings className="w-3 h-3" style={{ color: '#ffffff' }} />
      </Button>
    );
  }

  return (
    <>
      {/* Full-screen backdrop with high z-index */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Centered Settings Panel - Modal style */}
      <div 
        ref={panelRef}
        className={cn(
          "inline-block-settings rounded-lg p-4 w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto",
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          className
        )}
        style={{ 
          backgroundColor: '#1a1a1a', 
          border: '1px solid #2a2a2a',
          zIndex: 210,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 10px 25px -5px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium" style={{ color: '#ffffff' }}>
            Configurações do Bloco
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 hover:bg-gray-700"
            style={{ color: '#ffffff' }}
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList 
            className="grid w-full grid-cols-4 mb-4"
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
              value="spacing"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              style={{ color: '#ffffff' }}
            >
              <Move className="w-3 h-3 mr-1" />
              Espaçamento
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

          <TabsContent value="general">
            <GeneralSettings
              block={block}
              onContentUpdate={handleContentUpdate}
              onVisibilityToggle={handleVisibilityToggle}
            />
          </TabsContent>

          <TabsContent value="alignment">
            <InlineAlignmentControls
              alignment={block.meta?.alignment?.vertical || 'top'}
              onAlignmentChange={handleAlignmentChange}
            />
            <div className="text-xs mt-3" style={{ color: '#6b7280' }}>
              Controla o alinhamento vertical do conteúdo em grids com alturas diferentes.
            </div>
          </TabsContent>

          <TabsContent value="spacing">
            <SpacingControls
              block={block}
              onUpdate={onUpdate}
            />
          </TabsContent>

          <TabsContent value="colors">
            <ColorSettings
              block={block}
              onColorChange={handleColorChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
