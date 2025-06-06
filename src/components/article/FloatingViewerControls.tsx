
// ABOUTME: Floating minimalistic viewer controls that stay accessible during scrolling
// Provides compact access to view mode and reading mode controls

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Columns2, Maximize, Maximize2, Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingViewerControlsProps {
  currentViewMode: 'native' | 'pdf' | 'dual';
  currentReadingMode: 'normal' | 'browser-fullscreen' | 'system-fullscreen';
  onViewModeChange: (mode: 'native' | 'pdf' | 'dual') => void;
  onReadingModeChange: (mode: 'normal' | 'browser-fullscreen' | 'system-fullscreen') => void;
  hasOriginalPDF?: boolean;
  hasNativeContent?: boolean;
  className?: string;
}

export const FloatingViewerControls: React.FC<FloatingViewerControlsProps> = ({
  currentViewMode,
  currentReadingMode,
  onViewModeChange,
  onReadingModeChange,
  hasOriginalPDF = false,
  hasNativeContent = true,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const currentViewModeData = availableViewModes.find(mode => mode.id === currentViewMode);
  const currentReadingModeData = readingModes.find(mode => mode.id === currentReadingMode);

  return (
    <div className={cn(
      "floating-viewer-controls fixed bottom-6 right-6 z-50 transition-all duration-300",
      className
    )}>
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex items-center gap-2 p-3">
            <div className="flex items-center gap-2 text-sm">
              {currentViewModeData && (
                <div className="flex items-center gap-1 text-gray-300">
                  <currentViewModeData.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentViewModeData.label}</span>
                </div>
              )}
              <span className="text-gray-500">•</span>
              {currentReadingModeData && (
                <div className="flex items-center gap-1 text-gray-300">
                  <currentReadingModeData.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentReadingModeData.label}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="p-1 h-auto text-gray-400 hover:text-white"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Controles de Visualização</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="p-1 h-auto text-gray-400 hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* View Mode Controls */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Modo de Visualização</label>
              <div className="flex flex-col gap-1">
                {availableViewModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentViewMode === mode.id;
                  
                  return (
                    <Button
                      key={mode.id}
                      onClick={() => {
                        onViewModeChange(mode.id);
                        setIsExpanded(false);
                      }}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start gap-2 text-sm",
                        isActive 
                          ? "bg-gray-600 text-white" 
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Reading Mode Controls */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Modo de Leitura</label>
              <div className="flex flex-col gap-1">
                {readingModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentReadingMode === mode.id;
                  
                  return (
                    <Button
                      key={mode.id}
                      onClick={() => {
                        onReadingModeChange(mode.id);
                        setIsExpanded(false);
                      }}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start gap-2 text-sm",
                        isActive 
                          ? "bg-gray-600 text-white" 
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
