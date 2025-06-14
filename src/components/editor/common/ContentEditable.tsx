
// ABOUTME: Generic content editable component.
// Provides a div that behaves like a rich text input.
import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ContentEditableProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string;
  onChange: (html: string) => void; // Changed to directly pass html string
  tagName?: keyof JSX.IntrinsicElements;
  placeholder?: string;
  disabled?: boolean;
}

export const ContentEditable: React.FC<ContentEditableProps> = ({
  html,
  onChange,
  tagName = 'div',
  className,
  placeholder,
  disabled,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(html);

  const emitChange = useCallback(() => {
    if (!ref.current) return;
    const currentHtml = ref.current.innerHTML;
    if (lastHtml.current !== currentHtml) {
      onChange(currentHtml);
      lastHtml.current = currentHtml;
    }
  }, [onChange]);

  useEffect(() => {
    if (ref.current && html !== ref.current.innerHTML) {
      ref.current.innerHTML = html;
      lastHtml.current = html;
    }
  }, [html]);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef && placeholderRef.current) {
      const observer = new MutationObserver(() => {
        if (placeholderRef.current) {
          placeholderRef.current.style.display = currentRef.textContent || currentRef.innerHTML.includes('<img') ? 'none' : 'block';
        }
      });
      observer.observe(currentRef, { childList: true, characterData: true, subtree: true });
      // Initial check
      if (placeholderRef.current) {
        placeholderRef.current.style.display = currentRef.textContent || currentRef.innerHTML.includes('<img') ? 'none' : 'block';
      }
      return () => observer.disconnect();
    }
  }, []);


  const Tag = tagName as any; // Use 'as any' to bypass intrinsic element type checking for dynamic tag

  return (
    <div className={cn("relative w-full", disabled && "opacity-70 pointer-events-none")}>
      {placeholder && !disabled && (
        <div
          ref={placeholderRef}
          className="absolute inset-0 text-gray-500 pointer-events-none p-1" // Match padding if any
          style={{ display: html ? 'none' : 'block' }}
        >
          {placeholder}
        </div>
      )}
      <Tag
        {...props}
        ref={ref}
        contentEditable={!disabled}
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={emitChange} // Use onInput for better compatibility with contentEditable
        onBlur={emitChange} // Also emit on blur to catch final changes
        className={cn("outline-none w-full", className)}
      />
    </div>
  );
};
