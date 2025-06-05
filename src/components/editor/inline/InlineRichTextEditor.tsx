
// ABOUTME: Inline rich text editor with WYSIWYG capabilities and color support
// Provides contextual rich text editing with formatting controls

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Link,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: string;
}

export const InlineRichTextEditor: React.FC<InlineRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite seu texto...",
  disabled = false,
  className,
  style,
  minHeight = "100px"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setCurrentValue(content);
    }
  };

  const renderToolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b border-gray-600 bg-gray-800">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => executeCommand('bold')}
        className="h-6 w-6 p-0"
      >
        <Bold className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => executeCommand('italic')}
        className="h-6 w-6 p-0"
      >
        <Italic className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => executeCommand('underline')}
        className="h-6 w-6 p-0"
      >
        <Underline className="w-3 h-3" />
      </Button>
      <div className="w-px h-4 bg-gray-600 mx-1" />
      <Button
        size="sm"
        variant="ghost"
        onClick={() => executeCommand('insertUnorderedList')}
        className="h-6 w-6 p-0"
      >
        <List className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => executeCommand('insertOrderedList')}
        className="h-6 w-6 p-0"
      >
        <ListOrdered className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => executeCommand('formatBlock', 'blockquote')}
        className="h-6 w-6 p-0"
      >
        <Quote className="w-3 h-3" />
      </Button>
    </div>
  );

  if (disabled) {
    return (
      <div 
        className={cn("prose prose-sm max-w-none", className)}
        style={style}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
    );
  }

  if (!isEditing) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "cursor-pointer min-h-[60px] p-2 rounded border border-transparent hover:border-gray-600 transition-colors",
          className
        )}
        style={{ ...style, minHeight }}
      >
        {value ? (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div 
            className="text-gray-500 italic"
            style={{ color: '#9ca3af' }}
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn("border border-gray-600 rounded-md overflow-hidden", className)}
      style={style}
    >
      {renderToolbar()}
      <div
        ref={editorRef}
        contentEditable
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={(e) => {
          const content = e.currentTarget.innerHTML;
          setCurrentValue(content);
        }}
        className="p-3 outline-none prose prose-sm max-w-none"
        style={{ 
          minHeight,
          backgroundColor: 'transparent',
          color: 'inherit'
        }}
        dangerouslySetInnerHTML={{ __html: currentValue }}
        suppressContentEditableWarning
      />
    </div>
  );
};
