
// ABOUTME: Image and figure display with caption and lightbox support
// Handles responsive images with proper accessibility

import React, { useEffect, useState } from 'react';
import { ReviewBlock, FigurePayload } from '@/types/review';
import { cn } from '@/lib/utils';
import { ZoomIn } from 'lucide-react';

interface FigureBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const FigureBlock: React.FC<FigureBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as FigurePayload;
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    // Track when this block comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInteraction?.(block.id, 'viewed', {
              block_type: 'figure',
              figure_number: payload.figure_number,
              has_caption: !!payload.caption,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onInteraction, payload.figure_number, payload.caption]);

  const handleImageClick = () => {
    setShowLightbox(true);
    onInteraction?.(block.id, 'lightbox_opened', {
      figure_number: payload.figure_number,
      timestamp: Date.now()
    });
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      <figure className="figure-block my-8">
        <div className="relative group cursor-pointer" onClick={handleImageClick}>
          <img
            src={payload.image_url}
            alt={payload.alt_text}
            className={cn(
              "w-full h-auto rounded-lg shadow-md transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            style={{
              maxWidth: payload.width ? `${payload.width}px` : '100%',
              height: payload.height ? `${payload.height}px` : 'auto'
            }}
          />
          
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Carregando...</span>
            </div>
          )}
          
          {/* Zoom overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
        
        {/* Caption */}
        {payload.caption && (
          <figcaption className="mt-3 text-sm text-gray-600 text-center italic">
            {payload.figure_number && (
              <strong>Figura {payload.figure_number}: </strong>
            )}
            {payload.caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={payload.image_url}
              alt={payload.alt_text}
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={() => setShowLightbox(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};
