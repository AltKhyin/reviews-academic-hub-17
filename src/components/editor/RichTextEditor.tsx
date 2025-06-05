
// ABOUTME: Rich text editor component for inline content editing
// Provides comprehensive text formatting capabilities within blocks

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Text, 
  Color,
  TextCursor,
  TextQuote,
  TextSelect,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  minimal?: boolean;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite aqui...",
  className,
  autoFocus = false,
  minimal = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    textColor: '#000000',
    backgroundColor: 'transparent'
  });
  
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorType, setColorType] = useState<'text' | 'background'>('text');

  // Update format state based on current selection
  const updateFormatState = useCallback(() => {
    if (!document.getSelection) return;
    
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      fontSize: parseInt(document.queryCommandValue('fontSize') || '16'),
      textColor: document.queryCommandValue('foreColor') || '#000000',
      backgroundColor: document.queryCommandValue('hiliteColor') || 'transparent'
    });
  }, []);

  // Execute formatting command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateFormatState();
    
    // Get updated content
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange, updateFormatState]);

  // Format button handlers
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');

  const handleFontSize = (delta: number) => {
    const newSize = Math.max(8, Math.min(72, formatState.fontSize + delta));
    execCommand('fontSize', '7'); // Reset to known state
    execCommand('fontSize', newSize.toString());
  };

  const handleTextColor = (color: string) => {
    execCommand('foreColor', color);
    setFormatState(prev => ({ ...prev, textColor: color }));
    setShowColorPicker(false);
  };

  const handleBackgroundColor = (color: string) => {
    execCommand('hiliteColor', color);
    setFormatState(prev => ({ ...prev, backgroundColor: color }));
    setShowColorPicker(false);
  };

  const handleCreateLink = () => {
    if (linkUrl.trim()) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleRemoveLink = () => {
    execCommand('unlink');
  };

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

  const ToolbarButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  }> = ({ onClick, active, icon: Icon, title }) => (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        active && "bg-[var(--editor-active-bg)] text-[var(--editor-primary-text)]"
      )}
      style={{
        backgroundColor: active ? 'var(--editor-active-bg)' : 'transparent',
        color: 'var(--editor-primary-text)'
      }}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );

  return (
    <div className={cn("rich-text-editor", className)}>
      {/* Toolbar */}
      {!minimal && (
        <div 
          className="flex items-center gap-1 p-2 border-b"
          style={{
            borderColor: 'var(--editor-primary-border)',
            backgroundColor: 'var(--editor-secondary-bg)'
          }}
        >
          {/* Basic Formatting */}
          <ToolbarButton
            onClick={handleBold}
            active={formatState.bold}
            icon={Bold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={handleItalic}
            active={formatState.italic}
            icon={Italic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={handleUnderline}
            active={formatState.underline}
            icon={Underline}
            title="Underline (Ctrl+U)"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Font Size */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => handleFontSize(-2)}
              icon={ZoomOut}
              title="Decrease font size"
            />
            <Badge 
              variant="outline" 
              className="text-xs px-2"
              style={{
                backgroundColor: 'var(--editor-card-bg)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}
            >
              {formatState.fontSize}px
            </Badge>
            <ToolbarButton
              onClick={() => handleFontSize(2)}
              icon={ZoomIn}
              title="Increase font size"
            />
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Colors */}
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                style={{ color: 'var(--editor-primary-text)' }}
              >
                <Color className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" style={{
              backgroundColor: 'var(--editor-card-bg)',
              borderColor: 'var(--editor-primary-border)'
            }}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={colorType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setColorType('text')}
                    className="flex-1"
                  >
                    <Text className="w-4 h-4 mr-1" />
                    Texto
                  </Button>
                  <Button
                    type="button"
                    variant={colorType === 'background' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setColorType('background')}
                    className="flex-1"
                  >
                    <TextSelect className="w-4 h-4 mr-1" />
                    Fundo
                  </Button>
                </div>
                
                <div>
                  <Label className="text-sm" style={{ color: 'var(--editor-primary-text)' }}>
                    {colorType === 'text' ? 'Cor do Texto' : 'Cor de Fundo'}
                  </Label>
                  <Input
                    type="color"
                    value={colorType === 'text' ? formatState.textColor : formatState.backgroundColor}
                    onChange={(e) => {
                      if (colorType === 'text') {
                        handleTextColor(e.target.value);
                      } else {
                        handleBackgroundColor(e.target.value);
                      }
                    }}
                    className="h-10 mt-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Link */}
          <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <PopoverTrigger asChild>
              <ToolbarButton
                onClick={() => setShowLinkDialog(true)}
                icon={Link}
                title="Create link"
              />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" style={{
              backgroundColor: 'var(--editor-card-bg)',
              borderColor: 'var(--editor-primary-border)'
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-url" style={{ color: 'var(--editor-primary-text)' }}>
                    URL do Link
                  </Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateLink}
                    disabled={!linkUrl.trim()}
                    className="flex-1"
                  >
                    Criar Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveLink}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={handleUndo}
            icon={Undo}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={handleRedo}
            icon={Redo}
            title="Redo (Ctrl+Y)"
          />
        </div>
      )}
      
      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
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
