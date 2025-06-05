
// ABOUTME: Enhanced inline rich text editor with cursor position preservation
// Prevents cursor jumping by maintaining selection state during content updates

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface SelectionState {
  start: number;
  end: number;
  collapsed: boolean;
}

export const InlineRichTextEditor: React.FC<InlineRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite aqui...',
  disabled = false,
  className = '',
  style = {}
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const lastValueRef = useRef(value);
  const isUpdatingRef = useRef(false);

  // Save cursor position
  const saveSelection = useCallback((): SelectionState | null => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preCaretRange.toString().length;
    const end = start + range.toString().length;

    return {
      start,
      end,
      collapsed: range.collapsed
    };
  }, []);

  // Restore cursor position
  const restoreSelection = useCallback((selectionState: SelectionState) => {
    if (!editorRef.current || !selectionState) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let charCount = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;

    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const textLength = textNode.textContent?.length || 0;

      if (!startNode && charCount + textLength >= selectionState.start) {
        startNode = textNode;
        startOffset = selectionState.start - charCount;
      }

      if (!endNode && charCount + textLength >= selectionState.end) {
        endNode = textNode;
        endOffset = selectionState.end - charCount;
        break;
      }

      charCount += textLength;
    }

    if (startNode) {
      const selection = window.getSelection();
      const range = document.createRange();
      
      try {
        range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length || 0));
        range.setEnd(endNode || startNode, Math.min(endOffset, (endNode || startNode).textContent?.length || 0));
        
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (error) {
        // Fallback: place cursor at end
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, []);

  // Update content without losing cursor position
  const updateContent = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    const currentContent = editorRef.current.innerHTML;
    if (currentContent !== value && value !== lastValueRef.current) {
      const selectionState = saveSelection();
      isUpdatingRef.current = true;
      
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
      
      // Restore selection after content update
      setTimeout(() => {
        if (selectionState && isFocused) {
          restoreSelection(selectionState);
        }
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [value, saveSelection, restoreSelection, isFocused]);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    const newContent = editorRef.current.innerHTML;
    if (newContent !== lastValueRef.current) {
      lastValueRef.current = newContent;
      onChange(newContent);
    }
  }, [onChange]);

  // Update format state
  const updateFormatState = useCallback(() => {
    if (!isFocused) return;
    
    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  }, [isFocused]);

  // Format commands
  const executeCommand = useCallback((command: string) => {
    if (!editorRef.current || disabled) return;

    document.execCommand(command, false);
    editorRef.current.focus();
    handleInput();
    updateFormatState();
  }, [disabled, handleInput, updateFormatState]);

  // Event handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    updateFormatState();
  }, [updateFormatState]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  }, [executeCommand]);

  // Update content when value changes externally
  useEffect(() => {
    updateContent();
  }, [updateContent]);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
    }
  }, [value]);

  const toolbarButtons = [
    { icon: Bold, command: 'bold', active: formatState.bold, title: 'Negrito (Ctrl+B)' },
    { icon: Italic, command: 'italic', active: formatState.italic, title: 'Itálico (Ctrl+I)' },
    { icon: Underline, command: 'underline', active: formatState.underline, title: 'Sublinhado (Ctrl+U)' }
  ];

  const alignmentButtons = [
    { icon: AlignLeft, command: 'justifyLeft', title: 'Alinhar à esquerda' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Centralizar' },
    { icon: AlignRight, command: 'justifyRight', title: 'Alinhar à direita' }
  ];

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', title: 'Lista com marcadores' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada' }
  ];

  return (
    <div className={cn("inline-rich-text-editor border rounded-lg overflow-hidden", className)}>
      {/* Toolbar - only show when focused */}
      {isFocused && (
        <div 
          className="flex items-center gap-1 p-2 border-b"
          style={{ 
            backgroundColor: '#212121',
            borderColor: '#2a2a2a'
          }}
        >
          {/* Format buttons */}
          {toolbarButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={index}
                variant={button.active ? "default" : "ghost"}
                size="sm"
                onClick={() => executeCommand(button.command)}
                title={button.title}
                className="w-8 h-8 p-0"
                style={{
                  backgroundColor: button.active ? '#3b82f6' : 'transparent',
                  color: button.active ? '#ffffff' : '#d1d5db'
                }}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Alignment buttons */}
          {alignmentButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => executeCommand(button.command)}
                title={button.title}
                className="w-8 h-8 p-0"
                style={{ color: '#d1d5db' }}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* List buttons */}
          {listButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => executeCommand(button.command)}
                title={button.title}
                className="w-8 h-8 p-0"
                style={{ color: '#d1d5db' }}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={updateFormatState}
        onKeyUp={updateFormatState}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "min-h-[100px] p-3 outline-none",
          "prose prose-invert max-w-none",
          "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
          "[&_ul]:my-2 [&_ol]:my-2",
          "[&_strong]:font-bold [&_em]:italic [&_u]:underline"
        )}
        style={{ 
          color: '#ffffff',
          backgroundColor: '#1a1a1a',
          direction: 'ltr',
          textAlign: 'left',
          ...style
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        .inline-rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
