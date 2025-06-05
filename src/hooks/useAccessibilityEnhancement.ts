
// ABOUTME: Accessibility enhancement hook for editor components
// Provides ARIA labels, keyboard navigation, and screen reader support

import { useCallback, useEffect, useRef } from 'react';

interface UseAccessibilityEnhancementProps {
  activeIndex?: number;
  totalItems: number;
  onNavigate?: (index: number) => void;
  onActivate?: (index: number) => void;
  enableKeyboardNavigation?: boolean;
  announceChanges?: boolean;
}

export const useAccessibilityEnhancement = ({
  activeIndex = -1,
  totalItems,
  onNavigate,
  onActivate,
  enableKeyboardNavigation = true,
  announceChanges = true
}: UseAccessibilityEnhancementProps) => {
  const announcementRef = useRef<HTMLDivElement>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!announceChanges) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, [announceChanges]);

  // Announce messages to screen readers
  const announce = useCallback((message: string) => {
    if (announcementRef.current && announceChanges) {
      announcementRef.current.textContent = message;
    }
  }, [announceChanges]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enableKeyboardNavigation || totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, totalItems - 1);
        onNavigate?.(nextIndex);
        announce(`Item ${nextIndex + 1} of ${totalItems} focused`);
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(activeIndex - 1, 0);
        onNavigate?.(prevIndex);
        announce(`Item ${prevIndex + 1} of ${totalItems} focused`);
        break;

      case 'Home':
        e.preventDefault();
        onNavigate?.(0);
        announce(`First item focused`);
        break;

      case 'End':
        e.preventDefault();
        onNavigate?.(totalItems - 1);
        announce(`Last item focused`);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) {
          onActivate?.(activeIndex);
          announce(`Item ${activeIndex + 1} activated`);
        }
        break;

      case 'Escape':
        e.preventDefault();
        onNavigate?.(-1);
        announce('Selection cleared');
        break;
    }
  }, [activeIndex, totalItems, onNavigate, onActivate, enableKeyboardNavigation, announce]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableKeyboardNavigation]);

  // Generate ARIA attributes for items
  const getItemProps = useCallback((index: number, label?: string) => ({
    role: 'option',
    'aria-selected': activeIndex === index,
    'aria-setsize': totalItems,
    'aria-posinset': index + 1,
    'aria-label': label || `Item ${index + 1} of ${totalItems}`,
    tabIndex: activeIndex === index ? 0 : -1,
    id: `item-${index}`
  }), [activeIndex, totalItems]);

  // Generate ARIA attributes for container
  const getContainerProps = useCallback(() => ({
    role: 'listbox',
    'aria-activedescendant': activeIndex >= 0 ? `item-${activeIndex}` : undefined,
    'aria-multiselectable': false,
    'aria-label': `List with ${totalItems} items`
  }), [activeIndex, totalItems]);

  // Focus management
  const focusItem = useCallback((index: number) => {
    const item = document.getElementById(`item-${index}`);
    if (item) {
      item.focus();
    }
  }, []);

  return {
    announce,
    getItemProps,
    getContainerProps,
    focusItem,
    handleKeyDown
  };
};

// Specialized hook for block editor accessibility
export const useBlockEditorAccessibility = (
  blocks: any[],
  activeBlockId: number | null,
  onBlockSelect: (blockId: number | null) => void
) => {
  const activeIndex = blocks.findIndex(block => block.id === activeBlockId);

  const accessibility = useAccessibilityEnhancement({
    activeIndex,
    totalItems: blocks.length,
    onNavigate: (index) => {
      const block = blocks[index];
      if (block) {
        onBlockSelect(block.id);
      }
    },
    onActivate: (index) => {
      const block = blocks[index];
      if (block) {
        // Trigger edit mode or other activation behavior
        onBlockSelect(block.id);
      }
    }
  });

  // Block-specific ARIA properties
  const getBlockProps = useCallback((block: any, index: number) => ({
    ...accessibility.getItemProps(index, `${block.type} block: ${block.payload?.title || 'Untitled'}`),
    'data-block-id': block.id,
    'data-block-type': block.type
  }), [accessibility]);

  return {
    ...accessibility,
    getBlockProps,
    activeIndex
  };
};
