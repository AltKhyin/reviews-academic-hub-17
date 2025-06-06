
// ABOUTME: Refactored inline block settings with improved positioning
// Main settings interface using focused sub-components with proper positioning

import React, { useState, useRef, useEffect } from 'react';
import { ReviewBlock } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Type, AlignLeft, Palette } from 'lucide-react';
import { InlineAlignmentControls } from './InlineAlignmentControls';
import { GeneralSettings } from './settings/GeneralSettings';
import { ColorSettings } from './settings/ColorSettings';
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!onUpdate) return null;

  // Calculate position relative to the clicked button
  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Panel dimensions (estimated)
    const panelWidth = 320;
    const panelHeight = 400;
    
    // Start with button position
    let top = buttonRect.bottom + 8; // 8px gap below button
    let left = buttonRect.left;
    
    // Adjust if panel would overflow right edge
    if (left + panelWidth > viewportWidth) {
      left = buttonRect.right - panelWidth;
    }
    
    // Adjust if panel would overflow bottom edge
    if (top + panelHeight > viewportHeight) {
      top = buttonRect.top - panelHeight - 8; // 8px gap above button
    }
    
    // Ensure panel doesn't go off-screen
    left = Math.max(8, Math.min(left, viewportWidth - panelWidth - 8));
    top = Math.max(8, top);
    
    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      // Recalculate on window resize
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100]"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Settings Panel - Positioned absolutely relative to viewport */}
      <div 
        ref={panelRef}
        className={cn("inline-block-settings rounded-lg p-3 min-w-80 max-w-sm", className)}
        style={{ 
          backgroundColor: '#1a1a1a', 
          border: '1px solid #2a2a2a',
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 110,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
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
