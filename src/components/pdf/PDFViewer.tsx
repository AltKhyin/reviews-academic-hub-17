
import React from 'react';

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
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-lg card-elevation h-full">
      <div className="mb-4">
        <h2 className="font-serif text-xl font-medium">{title}</h2>
      </div>
      <div className="w-full h-[calc(100%-3rem)] min-h-[800px] bg-[#121212] rounded-md overflow-hidden">
        {url && url !== 'placeholder.pdf' ? (
          <iframe
            src={url}
            className="w-full h-full rounded-md"
            title={title}
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
