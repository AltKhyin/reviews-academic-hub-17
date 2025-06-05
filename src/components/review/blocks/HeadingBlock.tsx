
// ABOUTME: Enhanced heading block with inline editing and styling support
// Supports different heading levels with proper semantic structure and customization

import React, { useEffect, useState } from 'react';
import { ReviewBlock, HeadingPayload } from '@/types/review';
import { cn } from '@/lib/utils';
import { Link, Edit3 } from 'lucide-react';

interface HeadingBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly = false,
  onUpdate
}) => {
  const payload = block.payload as HeadingPayload;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(payload.text || '');

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
    const baseClasses = "font-bold leading-tight group relative transition-colors duration-200";
    
    // Apply custom styles if they exist
    const customStyles = block.meta?.styles || {};
    const fontWeight = customStyles.fontWeight || 'bold';
    const textAlign = customStyles.textAlign || 'left';
    
    let sizeClasses = '';
    switch (level) {
      case 1:
        sizeClasses = "text-3xl md:text-4xl mb-6 mt-8";
        break;
      case 2:
        sizeClasses = "text-2xl md:text-3xl mb-5 mt-7";
        break;
      case 3:
        sizeClasses = "text-xl md:text-2xl mb-4 mt-6";
        break;
      case 4:
        sizeClasses = "text-lg md:text-xl mb-3 mt-5";
        break;
      case 5:
        sizeClasses = "text-base md:text-lg mb-3 mt-4";
        break;
      case 6:
        sizeClasses = "text-sm md:text-base mb-2 mt-3";
        break;
      default:
        sizeClasses = "text-xl mb-4 mt-6";
    }
    
    return cn(
      baseClasses, 
      sizeClasses,
      `font-${fontWeight}`,
      `text-${textAlign}`
    );
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

  const handleDoubleClick = () => {
    if (!readonly && onUpdate) {
      setIsEditing(true);
      setEditText(payload.text || '');
    }
  };

  const handleEditSave = () => {
    if (onUpdate && editText.trim()) {
      onUpdate({
        payload: { ...block.payload, text: editText.trim() }
      });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(payload.text || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const customStyles = block.meta?.styles || {};
  const headingStyle = {
    color: customStyles.color || 'inherit',
    fontWeight: customStyles.fontWeight || undefined,
    textAlign: customStyles.textAlign as any || undefined
  };

  if (isEditing) {
    return (
      <div className={getHeadingClasses(payload.level)}>
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none resize-none"
          style={headingStyle}
          autoFocus
          placeholder="Enter heading text..."
        />
      </div>
    );
  }

  return (
    <HeadingTag
      id={anchorId}
      className={getHeadingClasses(payload.level)}
      style={headingStyle}
      onDoubleClick={handleDoubleClick}
    >
      {payload.text || 'Untitled Heading'}
      
      {/* Edit indicator for non-readonly mode */}
      {!readonly && onUpdate && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
          aria-label="Edit heading"
          title="Double-click or click to edit"
        >
          <Edit3 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
      
      {/* Anchor link - appears on hover */}
      <button
        onClick={handleAnchorClick}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded"
        aria-label={`Link para seção: ${payload.text}`}
        title="Copy section link"
      >
        <Link className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </button>
    </HeadingTag>
  );
};
