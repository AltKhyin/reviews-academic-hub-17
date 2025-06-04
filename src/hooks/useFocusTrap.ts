
import { useEffect, useRef, useCallback } from 'react';

export const useFocusTrap = (isActive: boolean) => {
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
    
    if (focusableElements.length === 0) return;

    firstFocusableElementRef.current = focusableElements[0] as HTMLElement;
    lastFocusableElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;
  }, []);

  useEffect(() => {
    if (!isActive) {
      // Restore focus to previously focused element when trap is deactivated
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
        previouslyFocusedElementRef.current = null;
      }
      return;
    }

    // Store the currently focused element
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    updateFocusableElements();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      updateFocusableElements();

      if (!firstFocusableElementRef.current || !lastFocusableElementRef.current) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElementRef.current) {
          lastFocusableElementRef.current.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElementRef.current) {
          firstFocusableElementRef.current.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element when trap is activated
    setTimeout(() => {
      firstFocusableElementRef.current?.focus();
    }, 0);

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive, updateFocusableElements]);

  return containerRef;
};
