
// ABOUTME: Rich text editor toolbar component
// Provides formatting controls for the rich text editor

import React, { useState } from 'react';
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
  Palette,
  TextSelect,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
}

interface RichTextToolbarProps {
  formatState: FormatState;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFontSize: (delta: number) => void;
  onTextColor: (color: string) => void;
  onBackgroundColor: (color: string) => void;
  onCreateLink: (url: string) => void;
  onRemoveLink: () => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  formatState,
  onBold,
  onItalic,
  onUnderline,
  onUndo,
  onRedo,
  onFontSize,
  onTextColor,
  onBackgroundColor,
  onCreateLink,
  onRemoveLink
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorType, setColorType] = useState<'text' | 'background'>('text');

  const handleCreateLink = () => {
    if (linkUrl.trim()) {
      onCreateLink(linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

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
    <div 
      className="flex items-center gap-1 p-2 border-b"
      style={{
        borderColor: 'var(--editor-primary-border)',
        backgroundColor: 'var(--editor-secondary-bg)'
      }}
    >
      {/* Basic Formatting */}
      <ToolbarButton
        onClick={onBold}
        active={formatState.bold}
        icon={Bold}
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton
        onClick={onItalic}
        active={formatState.italic}
        icon={Italic}
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton
        onClick={onUnderline}
        active={formatState.underline}
        icon={Underline}
        title="Underline (Ctrl+U)"
      />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Font Size */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => onFontSize(-2)}
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
          onClick={() => onFontSize(2)}
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
            <Palette className="w-4 h-4" />
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
                    onTextColor(e.target.value);
                  } else {
                    onBackgroundColor(e.target.value);
                  }
                  setShowColorPicker(false);
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
                onClick={onRemoveLink}
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
        onClick={onUndo}
        icon={Undo}
        title="Undo (Ctrl+Z)"
      />
      <ToolbarButton
        onClick={onRedo}
        icon={Redo}
        title="Redo (Ctrl+Y)"
      />
    </div>
  );
};
