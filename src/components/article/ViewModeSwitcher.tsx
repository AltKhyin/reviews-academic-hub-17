
// ABOUTME: Enhanced view mode switcher for native reviews and PDFs
// Supports switching between native content, PDF reviews, and original articles

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Layers, BookOpen, Monitor } from 'lucide-react';
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
  hasNativeContent = false,
  hasPDFReview = false,
  className
}) => {
  const modes = [
    {
      id: 'native',
      label: 'Revisão Nativa',
      shortLabel: 'Nativa',
      icon: Layers,
      description: 'Conteúdo interativo e estruturado',
      available: hasNativeContent,
      color: 'blue'
    },
    {
      id: 'pdf',
      label: 'Artigo Original',
      shortLabel: 'Original',
      icon: BookOpen,
      description: 'PDF do artigo científico original',
      available: hasOriginalPDF,
      color: 'green'
    },
    {
      id: 'dual',
      label: 'Visualização Dupla',
      shortLabel: 'Dupla',
      icon: Monitor,
      description: 'Revisão nativa e artigo original lado a lado',
      available: hasNativeContent && hasOriginalPDF,
      color: 'purple'
    }
  ];

  const availableModes = modes.filter(mode => mode.available);

  if (availableModes.length <= 1) {
    return null; // Don't show switcher if there's only one option
  }

  const getButtonVariant = (modeId: string) => {
    return currentMode === modeId ? 'default' : 'outline';
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return '';
    
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return '';
    }
  };

  return (
    <div className={cn("view-mode-switcher", className)}>
      {/* Desktop Version - Full Labels */}
      <div className="hidden md:flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
        {availableModes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant={getButtonVariant(mode.id)}
              size="sm"
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                isActive && getColorClasses(mode.color, true)
              )}
              title={mode.description}
            >
              <IconComponent className="w-4 h-4" />
              <span>{mode.label}</span>
              {mode.id === 'native' && hasNativeContent && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Novo
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Mobile Version - Icons + Short Labels */}
      <div className="md:hidden flex items-center gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
        {availableModes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant={getButtonVariant(mode.id)}
              size="sm"
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[70px] h-auto py-2 px-2 transition-all duration-200",
                isActive && getColorClasses(mode.color, true)
              )}
              title={mode.description}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-xs leading-none">{mode.shortLabel}</span>
              {mode.id === 'native' && hasNativeContent && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Mode Description - Desktop Only */}
      <div className="hidden lg:block mt-2">
        {availableModes.map((mode) => {
          if (currentMode === mode.id) {
            return (
              <p key={mode.id} className="text-sm text-gray-600">
                {mode.description}
              </p>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
