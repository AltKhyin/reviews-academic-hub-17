
// ABOUTME: Enhanced inline text editor with improved UX and visual feedback
// Provides seamless click-to-edit functionality with clear edit state indicators

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  editClassName?: string;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  showEditHint?: boolean;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite aqui...',
  multiline = false,
  className = '',
  editClassName = '',
  disabled = false,
  maxLength,
  autoFocus = false,
  showEditHint = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (autoFocus) {
        inputRef.current.select();
      }
    }
  }, [isEditing, autoFocus]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
    setTempValue(value);
  }, [disabled, value]);

  const handleSave = useCallback(() => {
    onChange(tempValue);
    setIsEditing(false);
  }, [onChange, tempValue]);

  const handleCancel = useCallback(() => {
    setTempValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent block-level shortcuts
    
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    }
  }, [multiline, handleSave, handleCancel]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Small delay to allow button clicks
    setTimeout(() => {
      if (!isFocused) {
        handleSave();
      }
    }, 150);
  }, [isFocused, handleSave]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const displayValue = value || placeholder;
  const isEmpty = !value;

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    return (
      <div className={cn("inline-editor-container relative", editClassName)}>
        <div className="flex items-start gap-2">
          <InputComponent
            ref={inputRef as any}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            maxLength={maxLength}
            className={cn(
              "inline-editor-input min-w-0 flex-1 bg-gray-900 border-blue-500 text-white",
              multiline && "min-h-[100px] resize-none"
            )}
            style={{
              backgroundColor: '#212121',
              borderColor: '#3b82f6',
              color: '#ffffff'
            }}
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="w-6 h-6 p-0 hover:bg-green-600/20"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur
            >
              <Check className="w-3 h-3" style={{ color: '#10b981' }} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="w-6 h-6 p-0 hover:bg-red-600/20"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur
            >
              <X className="w-3 h-3" style={{ color: '#ef4444' }} />
            </Button>
          </div>
        </div>
        {multiline && (
          <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
            Ctrl+Enter para salvar, Esc para cancelar
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-editor-display group cursor-pointer transition-all duration-200",
        "hover:bg-gray-800/30 rounded px-2 py-1 -mx-2 -my-1 relative",
        isEmpty && "italic",
        className
      )}
      onClick={handleStartEdit}
      style={{
        color: isEmpty ? '#9ca3af' : '#ffffff'
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1 min-w-0 break-words">
          {displayValue}
        </span>
        {!disabled && showEditHint && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0">
            <Edit3 className="w-3 h-3" style={{ color: '#9ca3af' }} />
            <span className="text-xs" style={{ color: '#9ca3af' }}>
              Clique para editar
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
