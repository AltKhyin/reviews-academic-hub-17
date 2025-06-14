
// ABOUTME: A simple content editable component for React.
// Wraps a div with contentEditable, managing HTML content and change events.
import React, { useRef, useEffect, useCallback } from 'react';

interface ContentEditableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  html: string;
  onChange: (event: React.ChangeEvent<HTMLDivElement & { target: { value: string } }>) => void;
  tagName?: keyof JSX.IntrinsicElements;
  placeholder?: string;
  disabled?: boolean; // To control contentEditable attribute
}

export const ContentEditable: React.FC<ContentEditableProps> = ({
  html,
  onChange,
  tagName = 'div',
  placeholder,
  className,
  disabled = false, // Default to false (editable)
  ...props
}) => {
  const ref = useRef<HTMLElement>(null); // More generic for tagName
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const lastHtml = useRef(html);

  // Update innerHTML when html prop changes externally
  useEffect(() => {
    if (ref.current && html !== ref.current.innerHTML) {
      ref.current.innerHTML = html;
      lastHtml.current = html; // Sync lastHtml
    }
  }, [html]);

  // Update placeholder visibility based on content
  useEffect(() => {
    if (placeholderRef.current) {
      const currentContent = ref.current?.innerHTML || '';
      placeholderRef.current.style.display = currentContent ? 'none' : 'inline-block';
    }
  }, [html, ref.current?.innerHTML]); // Re-check on html or direct DOM changes

  const emitChange = useCallback(() => {
    if (ref.current) {
      const newHtml = ref.current.innerHTML;
      if (newHtml !== lastHtml.current) {
        const event = {
          target: { value: newHtml },
        } as React.ChangeEvent<HTMLDivElement & { target: { value: string } }>;
        onChange(event);
        lastHtml.current = newHtml; // Update lastHtml after emitting change
      }
      // Update placeholder after potential change
      if (placeholderRef.current) {
        placeholderRef.current.style.display = newHtml ? 'none' : 'inline-block';
      }
    }
  }, [onChange]);

  const Tag = tagName as React.ElementType;

  return (
    <div style={{ position: 'relative' }} className={className}>
      {placeholder && (
        <span
          ref={placeholderRef}
          style={{
            position: 'absolute',
            top: '0.25rem', // Adjust if padding changes (p-1)
            left: '0.25rem',
            color: '#6b7280', // gray-500
            pointerEvents: 'none',
            display: (ref.current?.innerHTML || html) ? 'none' : 'inline-block', // Initial check
            fontSize: 'inherit', // Inherit font size from parent
            lineHeight: 'inherit', // Inherit line height for better alignment
          }}
          className="italic text-gray-500" // Added some Tailwind classes
        >
          {placeholder}
        </span>
      )}
      <Tag
        {...props}
        ref={ref}
        onInput={emitChange}
        onBlur={emitChange} // Emit on blur to catch final changes
        contentEditable={!disabled} // Control editability
        dangerouslySetInnerHTML={{ __html: html }} // Initial content
        // className is passed via ...props, so it's merged if provided
      />
    </div>
  );
};

