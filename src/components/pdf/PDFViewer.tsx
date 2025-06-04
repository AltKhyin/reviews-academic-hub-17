
import React, { useState } from 'react';
import { Maximize, BookOpen, FileText, SplitSquareVertical } from 'lucide-react';
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
  const [isReadingMode, setIsReadingMode] = useState(false);
  
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
  
  const handleReadingMode = () => {
    setIsReadingMode(!isReadingMode);
    // Note: Removed sidebar control since this app uses a different sidebar system
  };
  
  return (
    <div className={`bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation h-full flex flex-col overflow-visible ${isReadingMode ? 'fixed inset-0 z-50' : ''}`}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
        {url && url !== 'placeholder.pdf' && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReadingMode}>
              <BookOpen size={16} className="mr-1" />
              <span>Modo de leitura</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFullScreen}>
              <Maximize size={16} className="mr-1" />
              <span>Tela cheia</span>
            </Button>
          </div>
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
      
      {isReadingMode && (
        <>
          <div className="absolute top-3 right-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleReadingMode}
              className="bg-gray-700/60 hover:bg-gray-600"
            >
              Fechar
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800/70 px-4 py-2 rounded-full flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => console.log('Original view not implemented in standalone viewer')}
              className="p-2 rounded-full"
            >
              <FileText size={20} className="text-gray-400" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => console.log('Dual view not implemented in standalone viewer')}
              className="p-2 rounded-full"
            >
              <SplitSquareVertical size={20} className="text-gray-400" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => console.log('Already in review view')}
              className="p-2 rounded-full bg-gray-700/70"
            >
              <BookOpen size={20} className="text-white" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
