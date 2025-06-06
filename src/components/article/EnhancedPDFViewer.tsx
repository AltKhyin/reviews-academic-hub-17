
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
    switch (height) {
      case 'tall':
        return 'h-[85vh]';
      case 'full':
        return 'h-screen';
      default:
        return 'h-[60vh]';
    }
  };

  return (
    <div className={cn(
      "bg-gray-900 rounded-lg shadow-lg overflow-hidden",
      readingMode === 'browser-fullscreen' && "fixed inset-0 z-50 rounded-none",
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
