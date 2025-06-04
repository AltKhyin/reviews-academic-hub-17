
import { useEffect, useRef } from 'react';

export const useFocusTrap = (isActive: boolean) => {
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    firstFocusableElementRef.current = focusableElements[0] as HTMLElement;
    lastFocusableElementRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElementRef.current) {
          lastFocusableElementRef.current?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElementRef.current) {
          firstFocusableElementRef.current?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element when trap is activated
    firstFocusableElementRef.current?.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
};
