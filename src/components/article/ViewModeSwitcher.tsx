
// ABOUTME: Enhanced view mode switcher with editor layout integration
// Triggers dynamic editor width changes for optimal editing experience

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewModeSwitcherProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
  hasOriginalPDF?: boolean;
  hasNativeContent?: boolean;
  hasPDFReview?: boolean;
  className?: string;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  hasOriginalPDF = false,
  hasNativeContent = true,
  hasPDFReview = false,
  className
}) => {

  // Trigger editor layout changes when switching to "dual" mode
  useEffect(() => {
    const triggerEditorLayoutChange = () => {
      let layoutMode: 'single' | 'dividir' | 'preview';
      
      switch (currentMode) {
        case 'dual':
          layoutMode = 'dividir';
          break;
        case 'pdf':
          layoutMode = 'preview';
          break;
        default:
          layoutMode = 'single';
      }

      // Dispatch custom event for editor layout
      const event = new CustomEvent('viewModeChange', {
        detail: { mode: layoutMode }
      });
      window.dispatchEvent(event);
      
      console.log('View mode changed, triggering editor layout:', {
        viewMode: currentMode,
        editorLayout: layoutMode
      });
    };

    triggerEditorLayoutChange();
  }, [currentMode]);

  const handleModeChange = (mode: string) => {
    console.log('ViewModeSwitcher: Changing mode from', currentMode, 'to', mode);
    onModeChange(mode);
  };

  const modes = [
    {
      id: 'native',
      label: 'Revisão',
      icon: FileText,
      enabled: hasNativeContent,
      description: 'Conteúdo estruturado e interativo'
    },
    {
      id: 'dual',
      label: 'Dividir',
      icon: Columns2,
      enabled: hasOriginalPDF && hasNativeContent,
      description: 'Revisão + Artigo lado a lado'
    },
    {
      id: 'pdf',
      label: 'Artigo Original',
      icon: Eye,
      enabled: hasOriginalPDF,
      description: 'PDF do artigo original'
    }
  ];

  const availableModes = modes.filter(mode => mode.enabled);

  if (availableModes.length <= 1) {
    return null;
  }

  return (
    <div className={cn("view-mode-switcher", className)}>
      <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg border border-gray-700">
        {availableModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              )}
              title={mode.description}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{mode.label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Mode Description */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        {currentMode === 'dual' && (
          <span className="text-blue-400">
            ✨ Editor expandido para melhor visualização
          </span>
        )}
        {currentMode === 'native' && "Visualização otimizada da revisão nativa"}
        {currentMode === 'pdf' && "Visualização do documento original em PDF"}
      </div>
    </div>
  );
};
