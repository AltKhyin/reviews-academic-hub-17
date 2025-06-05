
// ABOUTME: Accessibility enhancement hook for inline editing components
// Provides keyboard navigation, ARIA support, and screen reader optimization

import { useCallback, useEffect, useRef } from 'react';

interface UseAccessibilityEnhancementProps {
  onEscape?: () => void;
  onEnter?: () => void;
  onTab?: (direction: 'forward' | 'backward') => void;
  ariaLabel?: string;
  ariaDescription?: string;
  focusOnMount?: boolean;
}

export const useAccessibilityEnhancement = ({
  onEscape,
  onEnter,
  onTab,
  ariaLabel,
  ariaDescription,
  focusOnMount = false
}: UseAccessibilityEnhancementProps = {}) => {
  
  const elementRef = useRef<HTMLElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
        
      case 'Enter':
        if (onEnter && !event.shiftKey) {
          event.preventDefault();
          onEnter();
        }
        break;
        
      case 'Tab':
        if (onTab) {
          const direction = event.shiftKey ? 'backward' : 'forward';
          onTab(direction);
        }
        break;
    }
  }, [onEscape, onEnter, onTab]);

  // Set up keyboard event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management
  useEffect(() => {
    if (focusOnMount && elementRef.current) {
      elementRef.current.focus();
    }
  }, [focusOnMount]);

  // Generate ARIA attributes
  const ariaAttributes = {
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescription ? `${ariaLabel}-description` : undefined,
    'role': 'textbox',
    'tabIndex': 0
  };

  // Screen reader announcement helper
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management utilities
  const focusElement = useCallback(() => {
    elementRef.current?.focus();
  }, []);

  const blurElement = useCallback(() => {
    elementRef.current?.blur();
  }, []);

  // Check if element has focus
  const isFocused = useCallback(() => {
    return document.activeElement === elementRef.current;
  }, []);

  return {
    elementRef,
    ariaAttributes,
    announceToScreenReader,
    focusElement,
    blurElement,
    isFocused,
    handleKeyDown
  };
};

// Hook for managing focus trapping within a container
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};
