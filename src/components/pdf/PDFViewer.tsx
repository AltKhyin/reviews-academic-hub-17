
import React, { useState } from 'react';
import { Maximize } from 'lucide-react';
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
  
  const handleFullScreen = () => {
    const iframe = document.getElementById(`pdf-iframe-${title.replace(/\s+/g, '-')}`) as HTMLIFrameElement;
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };
  
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        {url && url !== 'placeholder.pdf' && (
          <Button variant="ghost" size="sm" onClick={handleFullScreen}>
            <Maximize size={16} className="mr-1" />
            <span>Tela cheia</span>
          </Button>
        )}
      </div>
      <div className="w-full flex-grow bg-[#121212] rounded-md overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
        {url && url !== 'placeholder.pdf' ? (
          <iframe
            id={`pdf-iframe-${title.replace(/\s+/g, '-')}`}
            src={url}
            className="w-full h-full rounded-md"
            title={title}
            style={{ display: 'block' }} // Ensures proper rendering in all browsers
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
