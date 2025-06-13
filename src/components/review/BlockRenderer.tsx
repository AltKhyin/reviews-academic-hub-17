
// ABOUTME: Block renderer with enhanced interface support and proper error boundaries
// Fixed to support all expected props from components and handle dynamic content safely

import React, { useEffect, useRef } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockErrorBoundary } from './BlockErrorBoundary';

export interface BlockRendererProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  onMove?: (direction: 'up' | 'down') => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  isSelected?: boolean;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  readonly = false,
  onUpdate,
  onMove,
  onDelete,
  onDuplicate,
  onInteraction,
  onSectionView,
  isSelected = false,
  className
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  // Handle viewport enter using intersection observer instead of invalid HTML attribute
  useEffect(() => {
    if (!onSectionView || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onSectionView(block.id);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [block.id, onSectionView]);

  // Safe rendering with error boundary protection
  const handleInteraction = (interactionType: string, data?: any) => {
    if (onInteraction) {
      onInteraction(block.id, interactionType, data);
    }
  };

  return (
    <BlockErrorBoundary blockId={block.id}>
      <div 
        ref={elementRef}
        className={`block-renderer ${className || ''} ${isSelected ? 'selected' : ''}`}
      >
        <div className="block-content">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Block Type: {block.type}
          </h4>
          <div className="text-xs text-gray-400 mb-2">
            ID: {block.id}
          </div>
          {block.content && (
            <div className="text-sm text-gray-200">
              <pre>{JSON.stringify(block.content, null, 2)}</pre>
            </div>
          )}
          
          {!readonly && (
            <div className="flex gap-2 mt-3">
              {onUpdate && (
                <button 
                  onClick={() => handleInteraction('edit')}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                >
                  Edit
                </button>
              )}
              {onMove && (
                <>
                  <button 
                    onClick={() => onMove('up')}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => onMove('down')}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded"
                  >
                    ↓
                  </button>
                </>
              )}
              {onDelete && (
                <button 
                  onClick={onDelete}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                >
                  Delete
                </button>
              )}
              {onDuplicate && (
                <button 
                  onClick={onDuplicate}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                >
                  Duplicate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </BlockErrorBoundary>
  );
};
