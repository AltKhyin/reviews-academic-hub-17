
// ABOUTME: Theme customization panel for the native editor
// Provides granular control over all color aspects of the editor

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Sun, 
  Moon, 
  Monitor,
  Copy,
  Check
} from 'lucide-react';
import { useEditorTheme } from '@/contexts/EditorThemeContext';
import { cn } from '@/lib/utils';

interface ThemeCustomizerProps {
  onClose?: () => void;
  className?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose, className }) => {
  const {
    currentTheme,
    appliedTheme,
    themeMode,
    availableThemes,
    customizations,
    setTheme,
    setThemeMode,
    customizeColor,
    resetCustomizations,
    exportTheme,
    importTheme
  } = useEditorTheme();

  const [importData, setImportData] = useState('');
  const [copied, setCopied] = useState(false);

  const handleColorChange = (path: string, value: string) => {
    customizeColor(path, value);
  };

  const handleExport = async () => {
    const data = exportTheme();
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      importTheme(importData);
      setImportData('');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const ColorInput: React.FC<{ 
    label: string; 
    path: string; 
    value: string; 
    description?: string;
  }> = ({ label, path, value, description }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={path} className="text-sm font-medium text-[var(--editor-primary-text)]">
          {label}
        </Label>
        <div 
          className="w-6 h-6 rounded border-2 border-[var(--editor-primary-border)]"
          style={{ backgroundColor: value }}
        />
      </div>
      {description && (
        <p className="text-xs text-[var(--editor-muted-text)]">{description}</p>
      )}
      <Input
        id={path}
        type="color"
        value={value}
        onChange={(e) => handleColorChange(path, e.target.value)}
        className="h-8 w-full"
      />
    </div>
  );

  return (
    <Card className={cn("theme-customizer", className)} style={{
      backgroundColor: 'var(--editor-card-bg)',
      borderColor: 'var(--editor-primary-border)'
    }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[var(--editor-primary-text)]">
            <Palette className="w-5 h-5" />
            Theme Customizer
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
            Base Theme
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {availableThemes.map((theme) => (
              <Button
                key={theme.id}
                variant={currentTheme.id === theme.id ? "default" : "outline"}
                onClick={() => setTheme(theme.id)}
                className="justify-start"
                style={{
                  backgroundColor: currentTheme.id === theme.id 
                    ? 'var(--editor-button-primary)' 
                    : 'var(--editor-button-secondary)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                {theme.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
            Theme Mode
          </Label>
          <div className="flex gap-2">
            {[
              { mode: 'light', icon: Sun, label: 'Light' },
              { mode: 'dark', icon: Moon, label: 'Dark' },
              { mode: 'auto', icon: Monitor, label: 'Auto' }
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={themeMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setThemeMode(mode as any)}
                style={{
                  backgroundColor: themeMode === mode 
                    ? 'var(--editor-button-primary)' 
                    : 'var(--editor-button-secondary)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />

        {/* Color Customization */}
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="palette">Palette</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorInput 
                label="Primary Background" 
                path="editor.primaryBg" 
                value={appliedTheme.editor.primaryBg}
                description="Main editor background color"
              />
              <ColorInput 
                label="Secondary Background" 
                path="editor.secondaryBg" 
                value={appliedTheme.editor.secondaryBg}
                description="Sidebar and secondary surfaces"
              />
              <ColorInput 
                label="Card Background" 
                path="editor.cardBg" 
                value={appliedTheme.editor.cardBg}
                description="Individual card backgrounds"
              />
              <ColorInput 
                label="Hover Background" 
                path="editor.hoverBg" 
                value={appliedTheme.editor.hoverBg}
                description="Background on hover states"
              />
              <ColorInput 
                label="Primary Border" 
                path="editor.primaryBorder" 
                value={appliedTheme.editor.primaryBorder}
                description="Main border color"
              />
              <ColorInput 
                label="Primary Text" 
                path="editor.primaryText" 
                value={appliedTheme.editor.primaryText}
                description="Main text color"
              />
              <ColorInput 
                label="Secondary Text" 
                path="editor.secondaryText" 
                value={appliedTheme.editor.secondaryText}
                description="Secondary text and labels"
              />
              <ColorInput 
                label="Muted Text" 
                path="editor.mutedText" 
                value={appliedTheme.editor.mutedText}
                description="Descriptions and muted content"
              />
            </div>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorInput 
                label="Block Background" 
                path="blocks.blockBackground" 
                value={appliedTheme.blocks.blockBackground}
                description="Individual block backgrounds"
              />
              <ColorInput 
                label="Block Hover" 
                path="blocks.blockHover" 
                value={appliedTheme.blocks.blockHover}
                description="Block hover state"
              />
              <ColorInput 
                label="Block Selected" 
                path="blocks.blockSelected" 
                value={appliedTheme.blocks.blockSelected}
                description="Selected block highlight"
              />
              <ColorInput 
                label="Snapshot Card Accent" 
                path="blocks.snapshotCardAccent" 
                value={appliedTheme.blocks.snapshotCardAccent}
                description="Snapshot card accent color"
              />
              <ColorInput 
                label="Heading Accent" 
                path="blocks.headingAccent" 
                value={appliedTheme.blocks.headingAccent}
                description="Heading block accent"
              />
              <ColorInput 
                label="Figure Accent" 
                path="blocks.figureAccent" 
                value={appliedTheme.blocks.figureAccent}
                description="Figure block accent"
              />
              <ColorInput 
                label="Table Accent" 
                path="blocks.tableAccent" 
                value={appliedTheme.blocks.tableAccent}
                description="Table block accent"
              />
              <ColorInput 
                label="Callout Accent" 
                path="blocks.calloutAccent" 
                value={appliedTheme.blocks.calloutAccent}
                description="Callout block accent"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorInput 
                label="Preview Background" 
                path="preview.previewBg" 
                value={appliedTheme.preview.previewBg}
                description="Main preview area background"
              />
              <ColorInput 
                label="Preview Card Background" 
                path="preview.previewCardBg" 
                value={appliedTheme.preview.previewCardBg}
                description="Preview content cards"
              />
              <ColorInput 
                label="Preview Header" 
                path="preview.previewHeaderBg" 
                value={appliedTheme.preview.previewHeaderBg}
                description="Preview header background"
              />
              <ColorInput 
                label="Preview Border" 
                path="preview.previewBorder" 
                value={appliedTheme.preview.previewBorder}
                description="Preview area borders"
              />
            </div>
          </TabsContent>

          <TabsContent value="palette" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorInput 
                label="Palette Background" 
                path="palette.paletteBg" 
                value={appliedTheme.palette.paletteBg}
                description="Block palette background"
              />
              <ColorInput 
                label="Palette Card Background" 
                path="palette.paletteCardBg" 
                value={appliedTheme.palette.paletteCardBg}
                description="Individual palette cards"
              />
              <ColorInput 
                label="Palette Card Hover" 
                path="palette.paletteCardHover" 
                value={appliedTheme.palette.paletteCardHover}
                description="Palette card hover state"
              />
              <ColorInput 
                label="Category Text" 
                path="palette.categoryText" 
                value={appliedTheme.palette.categoryText}
                description="Category header text"
              />
              <ColorInput 
                label="Block Title Text" 
                path="palette.blockTitleText" 
                value={appliedTheme.palette.blockTitleText}
                description="Block title color"
              />
              <ColorInput 
                label="Block Description Text" 
                path="palette.blockDescText" 
                value={appliedTheme.palette.blockDescText}
                description="Block description color"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetCustomizations}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="flex-1"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied!' : 'Export'}
            </Button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[var(--editor-primary-text)]">
              Import Theme
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste theme data..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleImport}
                disabled={!importData.trim()}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Customization Status */}
        {Object.keys(customizations).length > 0 && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--editor-primary-border)' }}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" style={{ 
                backgroundColor: 'var(--editor-card-bg)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}>
                {Object.keys(customizations).length} customization(s) applied
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
