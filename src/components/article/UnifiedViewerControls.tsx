
// ABOUTME: Unified viewer controls for managing view modes and reading modes
// Combines view mode switching with reading mode controls in one clean interface

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Columns2, Maximize, Maximize2, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedViewerControlsProps {
  currentViewMode: 'native' | 'pdf' | 'dual';
  currentReadingMode: 'normal' | 'browser-fullscreen' | 'system-fullscreen';
  onViewModeChange: (mode: 'native' | 'pdf' | 'dual') => void;
  onReadingModeChange: (mode: 'normal' | 'browser-fullscreen' | 'system-fullscreen') => void;
  hasOriginalPDF?: boolean;
  hasNativeContent?: boolean;
  className?: string;
}

export const UnifiedViewerControls: React.FC<UnifiedViewerControlsProps> = ({
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
      label: 'Revisão',
      icon: FileText,
      enabled: hasNativeContent,
    },
    {
      id: 'dual' as const,
      label: 'Dividir',
      icon: Columns2,
      enabled: hasOriginalPDF && hasNativeContent,
    },
    {
      id: 'pdf' as const,
      label: 'Artigo Original',
      icon: Eye,
      enabled: hasOriginalPDF,
    }
  ];

  const readingModes = [
    {
      id: 'normal' as const,
      label: 'Normal',
      icon: Monitor,
    },
    {
      id: 'browser-fullscreen' as const,
      label: 'Modo Leitura',
      icon: Maximize,
    },
    {
      id: 'system-fullscreen' as const,
      label: 'Tela Cheia',
      icon: Maximize2,
    }
  ];

  const availableViewModes = viewModes.filter(mode => mode.enabled);

  if (availableViewModes.length <= 1) {
    return null;
  }

  return (
    <div className={cn("unified-viewer-controls", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        {/* View Mode Controls */}
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-md border border-gray-600">
          {availableViewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentViewMode === mode.id;
            
            return (
              <Button
                key={mode.id}
                onClick={() => onViewModeChange(mode.id)}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200",
                  isActive 
                    ? "bg-gray-600 text-white shadow-sm" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Reading Mode Controls */}
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-md border border-gray-600">
          {readingModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentReadingMode === mode.id;
            
            return (
              <Button
                key={mode.id}
                onClick={() => onReadingModeChange(mode.id)}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2 py-2 text-sm transition-all duration-200",
                  isActive 
                    ? "bg-gray-600 text-white shadow-sm" 
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                )}
                title={mode.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline text-xs">{mode.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
