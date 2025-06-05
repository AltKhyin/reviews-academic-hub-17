
// ABOUTME: Virtual scrolling hook for large block collections performance optimization
// Implements windowing to render only visible blocks for better performance

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface UseVirtualScrollingProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  enabled?: boolean;
}

interface VirtualScrollingResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    offsetTop: number;
  }>;
  totalHeight: number;
  scrollElementProps: {
    onScroll: (e: React.UIEvent) => void;
    style: React.CSSProperties;
  };
  containerProps: {
    style: React.CSSProperties;
  };
}

export const useVirtualScrolling = <T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  enabled = true
}: UseVirtualScrollingProps<T>): VirtualScrollingResult<T> => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement>();

  const handleScroll = useCallback((e: React.UIEvent) => {
    const element = e.target as HTMLElement;
    setScrollTop(element.scrollTop);
    scrollElementRef.current = element;
  }, []);

  const virtualItems = useMemo(() => {
    if (!enabled || items.length === 0) {
      return items.map((item, index) => ({
        index,
        item,
        offsetTop: index * itemHeight
      }));
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight
      });
    }

    return visibleItems;
  }, [items, itemHeight, scrollTop, containerHeight, overscan, enabled]);

  const totalHeight = items.length * itemHeight;

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const offsetTop = index * itemHeight;
      scrollElementRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }, [itemHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollElementProps: {
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto'
      }
    },
    containerProps: {
      style: {
        height: totalHeight,
        position: 'relative'
      }
    }
  };
};

// Hook for optimizing block editor performance with large collections
export const useBlockEditorOptimization = (blocks: any[], containerHeight: number) => {
  const ITEM_HEIGHT = 200; // Average block height
  const ENABLE_VIRTUAL = blocks.length > 50; // Enable for large collections

  const virtualScrolling = useVirtualScrolling({
    items: blocks,
    itemHeight: ITEM_HEIGHT,
    containerHeight,
    overscan: 3,
    enabled: ENABLE_VIRTUAL
  });

  // Performance metrics
  const metrics = useMemo(() => ({
    totalBlocks: blocks.length,
    renderedBlocks: virtualScrolling.virtualItems.length,
    performanceGain: ENABLE_VIRTUAL 
      ? Math.round((1 - (virtualScrolling.virtualItems.length / blocks.length)) * 100)
      : 0,
    memoryOptimization: ENABLE_VIRTUAL
  }), [blocks.length, virtualScrolling.virtualItems.length, ENABLE_VIRTUAL]);

  return {
    ...virtualScrolling,
    metrics,
    isVirtualized: ENABLE_VIRTUAL
  };
};
