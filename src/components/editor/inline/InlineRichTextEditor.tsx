
// ABOUTME: Fixed inline rich text editor with proper text direction and cursor positioning
// Provides WYSIWYG editing with formatting toolbar and direct content editing

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Check, 
  X, 
  Edit3,
  Type
} from 'lucide-react';
import { useRichTextFormat } from '@/hooks/useRichTextFormat';
import { cn } from '@/lib/utils';

interface InlineRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showToolbar?: boolean;
  style?: React.CSSProperties;
}

export const InlineRichTextEditor: React.FC<InlineRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite seu conteúdo...',
  className = '',
  disabled = false,
  showToolbar = true,
  style = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const { formatState, formatActions, updateFormatState } = useRichTextFormat(
    (newValue) => setTempValue(newValue), 
    editorRef
  );

  useEffect(() => {
    if (isEditing && editorRef.current) {
      // Fix: Proper focus and cursor positioning
      const editor = editorRef.current;
      editor.focus();
      
      // Set cursor to end of content - fixed approach
      setTimeout(() => {
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (editor.childNodes.length > 0) {
          const lastNode = editor.childNodes[editor.childNodes.length - 1];
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.textContent?.length || 0);
          } else {
            range.setStartAfter(lastNode);
          }
        } else {
          range.setStart(editor, 0);
        }
        
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 0);
    }
  }, [isEditing]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
    setTempValue(value);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setTempValue(newContent);
      updateFormatState();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatActions.bold();
          break;
        case 'i':
          e.preventDefault();
          formatActions.italic();
          break;
        case 'u':
          e.preventDefault();
          formatActions.underline();
          break;
      }
    }
  };

  // Clean display value for preview
  const getDisplayValue = () => {
    if (!value) return placeholder;
    // Strip HTML tags for display
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    return tempDiv.textContent || tempDiv.innerText || placeholder;
  };

  if (isEditing) {
    return (
      <div className={cn("inline-rich-editor-container", className)} style={style}>
        {showToolbar && (
          <div 
            className="flex items-center gap-1 p-2 border-b mb-2"
            style={{ 
              backgroundColor: '#212121',
              borderColor: '#2a2a2a'
            }}
          >
            <Button
              size="sm"
              variant={formatState.bold ? "default" : "ghost"}
              onClick={formatActions.bold}
              className="w-8 h-8 p-0"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={formatState.italic ? "default" : "ghost"}
              onClick={formatActions.italic}
              className="w-8 h-8 p-0"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={formatState.underline ? "default" : "ghost"}
              onClick={formatActions.underline}
              className="w-8 h-8 p-0"
            >
              <Underline className="w-4 h-4" />
            </Button>
            
            <div className="flex-1" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="w-6 h-6 p-0"
            >
              <Check className="w-3 h-3" style={{ color: '#10b981' }} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="w-6 h-6 p-0"
            >
              <X className="w-3 h-3" style={{ color: '#ef4444' }} />
            </Button>
          </div>
        )}
        
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateFormatState}
          onKeyUp={updateFormatState}
          className="min-h-[100px] p-3 outline-none border rounded"
          style={{ 
            backgroundColor: '#1a1a1a',
            borderColor: '#3b82f6',
            color: '#ffffff',
            textAlign: 'left',
            ...style
          }}
          dangerouslySetInnerHTML={{ __html: tempValue }}
        />
        
        <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
          Ctrl+Enter para salvar, Esc para cancelar
        </div>
      </div>
    );
  }

  const displayValue = getDisplayValue();
  const isEmpty = !value;

  return (
    <div
      className={cn(
        "inline-rich-editor-display group cursor-pointer transition-all duration-200",
        "hover:bg-gray-800/30 rounded px-3 py-2 -mx-3 -my-2 min-h-[60px]",
        isEmpty && "italic",
        className
      )}
      onClick={handleStartEdit}
      style={{
        color: isEmpty ? '#9ca3af' : '#ffffff',
        textAlign: 'left',
        ...style
      }}
    >
      <div className="flex items-start gap-2">
        <Type className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
        <div className="flex-1 min-w-0 text-left">
          {isEmpty ? (
            <span className="italic">{placeholder}</span>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: value }}
              style={{ textAlign: 'left' }}
            />
          )}
        </div>
        {!disabled && (
          <Edit3 
            className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0 mt-0.5" 
            style={{ color: '#9ca3af' }}
          />
        )}
      </div>
    </div>
  );
};
