
// ABOUTME: Rich text editor for paragraph content with formatting toolbar
// Provides WYSIWYG editing capabilities with dark theme support

import React, { useRef, useEffect } from 'react';
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
  ListOrdered,
  Link,
  Undo,
  Redo
} from 'lucide-react';
import { useRichTextFormat } from '@/hooks/useRichTextFormat';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite seu conteúdo...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { formatState, formatActions, updateFormatState } = useRichTextFormat(onChange, editorRef);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      updateFormatState();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
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
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            formatActions.redo();
          } else {
            e.preventDefault();
            formatActions.undo();
          }
          break;
      }
    }
  };

  const toolbarButtons = [
    {
      group: 'formatting',
      buttons: [
        { icon: Bold, action: formatActions.bold, active: formatState.bold, title: 'Negrito (Ctrl+B)' },
        { icon: Italic, action: formatActions.italic, active: formatState.italic, title: 'Itálico (Ctrl+I)' },
        { icon: Underline, action: formatActions.underline, active: formatState.underline, title: 'Sublinhado (Ctrl+U)' }
      ]
    },
    {
      group: 'alignment',
      buttons: [
        { icon: AlignLeft, action: () => document.execCommand('justifyLeft'), title: 'Alinhar à esquerda' },
        { icon: AlignCenter, action: () => document.execCommand('justifyCenter'), title: 'Centralizar' },
        { icon: AlignRight, action: () => document.execCommand('justifyRight'), title: 'Alinhar à direita' }
      ]
    },
    {
      group: 'lists',
      buttons: [
        { icon: List, action: () => document.execCommand('insertUnorderedList'), title: 'Lista com marcadores' },
        { icon: ListOrdered, action: () => document.execCommand('insertOrderedList'), title: 'Lista numerada' }
      ]
    },
    {
      group: 'history',
      buttons: [
        { icon: Undo, action: formatActions.undo, title: 'Desfazer (Ctrl+Z)' },
        { icon: Redo, action: formatActions.redo, title: 'Refazer (Ctrl+Shift+Z)' }
      ]
    }
  ];

  return (
    <div 
      className={`rich-text-editor border rounded-lg overflow-hidden ${className}`}
      style={{ 
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      {/* Toolbar */}
      <div 
        className="flex items-center gap-1 p-2 border-b"
        style={{ 
          backgroundColor: '#212121',
          borderColor: '#2a2a2a'
        }}
      >
        {toolbarButtons.map((group, groupIndex) => (
          <React.Fragment key={group.group}>
            {group.buttons.map((button, buttonIndex) => {
              const IconComponent = button.icon;
              return (
                <Button
                  key={buttonIndex}
                  variant={button.active ? "default" : "ghost"}
                  size="sm"
                  onClick={button.action}
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
            {groupIndex < toolbarButtons.length - 1 && (
              <Separator orientation="vertical" className="mx-1 h-4" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={updateFormatState}
        onKeyUp={updateFormatState}
        className="min-h-[200px] p-4 outline-none"
        style={{ 
          color: '#ffffff',
          backgroundColor: '#1a1a1a'
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        
        [contenteditable] p {
          margin: 0 0 1em 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 1.5em;
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
