
// ABOUTME: Heading block component with TOC integration and anchor links
// Supports different heading levels with proper semantic structure

import React, { useEffect } from 'react';
import { ReviewBlock, HeadingPayload } from '@/types/review';
import { cn } from '@/lib/utils';
import { Link } from 'lucide-react';

interface HeadingBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  const payload = block.payload as HeadingPayload;

  useEffect(() => {
    // Track when this section comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onSectionView?.(block.id.toString());
            onInteraction?.(block.id.toString(), 'section_viewed', {
              block_type: 'heading',
              heading_level: payload.level,
              heading_text: payload.text,
              timestamp: Date.now()
            });
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );

    const element = document.querySelector(`[data-block-id="${block.id}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [block.id, onSectionView, onInteraction, payload.level, payload.text]);

  const getHeadingClasses = (level: number) => {
    const baseClasses = "font-bold text-gray-900 leading-tight group relative";
    
    switch (level) {
      case 1:
        return cn(baseClasses, "text-3xl md:text-4xl mb-6 mt-8");
      case 2:
        return cn(baseClasses, "text-2xl md:text-3xl mb-5 mt-7");
      case 3:
        return cn(baseClasses, "text-xl md:text-2xl mb-4 mt-6");
      case 4:
        return cn(baseClasses, "text-lg md:text-xl mb-3 mt-5");
      case 5:
        return cn(baseClasses, "text-base md:text-lg mb-3 mt-4");
      case 6:
        return cn(baseClasses, "text-sm md:text-base mb-2 mt-3");
      default:
        return cn(baseClasses, "text-xl mb-4 mt-6");
    }
  };

  const HeadingTag = `h${payload.level}` as keyof JSX.IntrinsicElements;
  const anchorId = payload.anchor_id || payload.slug || `heading-${block.id}`;

  const handleAnchorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update URL with anchor
      window.history.pushState(null, '', `#${anchorId}`);
      
      // Track interaction
      onInteraction?.(block.id.toString(), 'anchor_clicked', {
        anchor_id: anchorId,
        heading_text: payload.text
      });
    }
  };

  return (
    <HeadingTag
      id={anchorId}
      className={getHeadingClasses(payload.level)}
    >
      {payload.text}
      
      {/* Anchor link - appears on hover */}
      <button
        onClick={handleAnchorClick}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
        aria-label={`Link para seção: ${payload.text}`}
        title="Copiar link da seção"
      >
        <Link className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>
    </HeadingTag>
  );
};
