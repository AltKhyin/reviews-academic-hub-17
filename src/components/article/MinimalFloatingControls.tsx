
// ABOUTME: Minimal floating controls with 6 icons for deep scroll situations
// Provides ultra-compact access to essential viewing controls

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Columns2, Maximize, Maximize2, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalFloatingControlsProps {
  currentViewMode: 'native' | 'pdf' | 'dual';
  currentReadingMode: 'normal' | 'browser-fullscreen' | 'system-fullscreen';
  onViewModeChange: (mode: 'native' | 'pdf' | 'dual') => void;
  onReadingModeChange: (mode: 'normal' | 'browser-fullscreen' | 'system-fullscreen') => void;
  hasOriginalPDF?: boolean;
  hasNativeContent?: boolean;
  className?: string;
}

export const MinimalFloatingControls: React.FC<MinimalFloatingControlsProps> = ({
  currentViewMode,
  currentReadingMode,
  onViewModeChange,
  onReadingModeChange,
  hasOriginalPDF = false,
  hasNativeContent = true,
  className
}) => {
  const viewModes = [
    {
      id: 'native' as const,
      icon: FileText,
      enabled: hasNativeContent,
      title: 'Revisão'
    },
    {
      id: 'dual' as const,
      icon: Columns2,
      enabled: hasOriginalPDF && hasNativeContent,
      title: 'Dividir'
    },
    {
      id: 'pdf' as const,
      icon: Eye,
      enabled: hasOriginalPDF,
      title: 'Artigo Original'
    }
  ];

  const readingModes = [
    {
      id: 'normal' as const,
      icon: Monitor,
      title: 'Normal'
    },
    {
      id: 'browser-fullscreen' as const,
      icon: Maximize,
      title: 'Modo Leitura'
    },
    {
      id: 'system-fullscreen' as const,
      icon: Maximize2,
      title: 'Tela Cheia'
    }
  ];

  const availableViewModes = viewModes.filter(mode => mode.enabled);

  if (availableViewModes.length <= 1) {
    return null;
  }

  return (
    <div className={cn(
      "minimal-floating-controls fixed bottom-6 right-6 z-50",
      className
    )}>
      <div className="flex flex-col gap-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-lg">
        {/* View Mode Icons */}
        {availableViewModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentViewMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              onClick={() => onViewModeChange(mode.id)}
              variant="ghost"
              size="sm"
              className={cn(
                "w-10 h-10 p-0 transition-all duration-200",
                isActive 
                  ? "bg-gray-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
              title={mode.title}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}

        {/* Separator */}
        <div className="w-full h-px bg-gray-700 my-1" />

        {/* Reading Mode Icons */}
        {readingModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentReadingMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              onClick={() => onReadingModeChange(mode.id)}
              variant="ghost"
              size="sm"
              className={cn(
                "w-10 h-10 p-0 transition-all duration-200",
                isActive 
                  ? "bg-gray-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
              title={mode.title}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>
    </div>
  );
};
