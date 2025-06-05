
// ABOUTME: Rich text editor component for inline content editing
// Provides comprehensive text formatting capabilities within blocks

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RichTextToolbar } from './RichTextToolbar';
import { useRichTextFormat } from '@/hooks/useRichTextFormat';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  minimal?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "Digite aqui...",
  className,
  autoFocus = false,
  minimal = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { formatState, formatActions, updateFormatState } = useRichTextFormat(onChange, editorRef);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
    updateFormatState();
  }, [onChange, updateFormatState]);

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    updateFormatState();
  }, [updateFormatState]);

  // Handle editor blur
  const handleEditorBlur = useCallback(() => {
    setIsEditing(false);
    onBlur?.();
  }, [onBlur]);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Add event listeners
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div className={cn("rich-text-editor", className)}>
      {/* Toolbar */}
      {!minimal && (
        <RichTextToolbar
          formatState={formatState}
          onBold={formatActions.bold}
          onItalic={formatActions.italic}
          onUnderline={formatActions.underline}
          onUndo={formatActions.undo}
          onRedo={formatActions.redo}
          onFontSize={formatActions.fontSize}
          onTextColor={formatActions.textColor}
          onBackgroundColor={formatActions.backgroundColor}
          onCreateLink={formatActions.createLink}
          onRemoveLink={formatActions.removeLink}
        />
      )}
      
      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        onBlur={handleEditorBlur}
        className={cn(
          "prose prose-sm max-w-none min-h-[100px] p-4 focus:outline-none",
          "prose-p:my-2 prose-headings:my-2",
          isEditing && "ring-2 ring-[var(--editor-focus-border)] ring-opacity-50"
        )}
        style={{
          backgroundColor: 'var(--editor-card-bg)',
          color: 'var(--editor-primary-text)'
        }}
        data-placeholder={placeholder}
      />
      
      {/* Empty state */}
      {!value && !isEditing && (
        <div 
          className="absolute inset-0 flex items-start justify-start p-4 pointer-events-none"
          style={{ color: 'var(--editor-muted-text)' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};
