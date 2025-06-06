
// ABOUTME: Enhanced PDF viewer with variable height and fullscreen support
// Supports different viewing contexts and reading modes

import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedPDFViewerProps {
  url?: string;
  title: string;
  className?: string;
  height?: 'normal' | 'tall' | 'full';
  readingMode?: 'normal' | 'browser-fullscreen' | 'system-fullscreen';
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({ 
  url, 
  title,
  className,
  height = 'normal',
  readingMode = 'normal'
}) => {
  const getHeightClass = () => {
    // Adjust height based on reading mode to prevent popup behavior
    if (readingMode !== 'normal') {
      switch (height) {
        case 'tall':
          return 'h-[80vh]';
        case 'full':
          return 'h-[90vh]';
        default:
          return 'h-[60vh]';
      }
    }
    
    switch (height) {
      case 'tall':
        return 'h-[85vh]';
      case 'full':
        return 'h-screen';
      default:
        return 'h-[60vh]';
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "bg-gray-900 rounded-lg shadow-lg overflow-hidden";
    
    // Don't apply fixed positioning in reading modes when used in dual view
    if (readingMode === 'browser-fullscreen') {
      return cn(baseClasses, "relative");
    }
    
    return baseClasses;
  };

  return (
    <div className={cn(
      getContainerClasses(),
      className
    )}>
      <div className={cn(
        "w-full bg-gray-800 overflow-hidden",
        getHeightClass()
      )}>
        {url && url !== 'placeholder.pdf' ? (
          <iframe
            src={url}
            className="w-full h-full"
            title={title}
            style={{ display: 'block' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-gray-400 mb-4 text-center">PDF não disponível</p>
          </div>
        )}
      </div>
    </div>
  );
};
