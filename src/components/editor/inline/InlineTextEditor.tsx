
// ABOUTME: Simple inline text editor for single-line text editing
// Provides clean interface for basic text input with visual feedback

import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
  multiline?: boolean;
  style?: React.CSSProperties;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite aqui...',
  className = '',
  readonly = false,
  multiline = false,
  style = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readonly) return;
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter') {
      if (!multiline || e.ctrlKey) {
        e.preventDefault();
        handleSave();
      }
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className={cn("inline-text-editor-container flex items-center gap-2", className)} style={style}>
        <InputComponent
          ref={inputRef as any}
          type={multiline ? undefined : "text"}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            "flex-1 px-2 py-1 text-sm border rounded outline-none",
            multiline && "min-h-[60px] resize-y"
          )}
          style={{
            backgroundColor: '#2a2a2a',
            borderColor: '#3b82f6',
            color: '#ffffff'
          }}
          placeholder={placeholder}
          rows={multiline ? 3 : undefined}
        />
        
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="p-1 rounded hover:bg-gray-700"
            style={{ color: '#10b981' }}
            title="Salvar"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="p-1 rounded hover:bg-gray-700"
            style={{ color: '#ef4444' }}
            title="Cancelar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  const displayValue = value || placeholder;
  const isEmpty = !value;

  return (
    <div
      className={cn(
        "inline-text-editor-display group cursor-pointer transition-all duration-200",
        "hover:bg-gray-800/30 rounded px-2 py-1 -mx-2 -my-1",
        isEmpty && "italic",
        className
      )}
      onClick={handleStartEdit}
      style={{
        color: isEmpty ? '#9ca3af' : 'inherit',
        ...style
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1">
          {isEmpty ? (
            <span className="italic">{placeholder}</span>
          ) : (
            value
          )}
        </span>
        {!readonly && (
          <Edit3 
            className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" 
            style={{ color: '#9ca3af' }}
          />
        )}
      </div>
    </div>
  );
};
