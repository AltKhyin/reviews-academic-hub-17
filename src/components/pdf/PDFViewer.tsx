
import React, { useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  url?: string;
  title: string;
  fallbackContent?: React.ReactNode;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  title,
  fallbackContent
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div 
      className={`bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation flex flex-col ${
        isFullScreen 
          ? 'fixed inset-0 z-50 rounded-none' 
          : 'h-full'
      }`}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleFullScreen}
          className="text-gray-400 hover:text-white"
        >
          {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </Button>
      </div>
      <div 
        className={`w-full flex-grow bg-[#121212] rounded-md overflow-hidden ${
          isFullScreen ? 'h-[calc(100vh-80px)]' : 'min-h-[800px]'
        }`}
      >
        {url && url !== 'placeholder.pdf' ? (
          <iframe
            src={url}
            className="w-full h-full rounded-md"
            title={title}
            style={{ height: '100%', minHeight: isFullScreen ? 'calc(100vh - 80px)' : '800px' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-gray-400 mb-4 text-center">PDF não disponível</p>
            {fallbackContent}
          </div>
        )}
      </div>
    </div>
  );
};
