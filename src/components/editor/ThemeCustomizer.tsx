
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
import { ColorPicker } from '@/components/ui/color-picker';
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
              <ColorPicker 
                label="Primary Background" 
                value={appliedTheme.editor.primaryBg}
                onChange={(value) => handleColorChange('editor.primaryBg', value)}
                description="Main editor background color"
              />
              <ColorPicker 
                label="Secondary Background" 
                value={appliedTheme.editor.secondaryBg}
                onChange={(value) => handleColorChange('editor.secondaryBg', value)}
                description="Sidebar and secondary surfaces"
              />
              <ColorPicker 
                label="Card Background" 
                value={appliedTheme.editor.cardBg}
                onChange={(value) => handleColorChange('editor.cardBg', value)}
                description="Individual card backgrounds"
              />
              <ColorPicker 
                label="Hover Background" 
                value={appliedTheme.editor.hoverBg}
                onChange={(value) => handleColorChange('editor.hoverBg', value)}
                description="Background on hover states"
              />
              <ColorPicker 
                label="Primary Border" 
                value={appliedTheme.editor.primaryBorder}
                onChange={(value) => handleColorChange('editor.primaryBorder', value)}
                description="Main border color"
              />
              <ColorPicker 
                label="Primary Text" 
                value={appliedTheme.editor.primaryText}
                onChange={(value) => handleColorChange('editor.primaryText', value)}
                description="Main text color"
              />
              <ColorPicker 
                label="Secondary Text" 
                value={appliedTheme.editor.secondaryText}
                onChange={(value) => handleColorChange('editor.secondaryText', value)}
                description="Secondary text and labels"
              />
              <ColorPicker 
                label="Muted Text" 
                value={appliedTheme.editor.mutedText}
                onChange={(value) => handleColorChange('editor.mutedText', value)}
                description="Descriptions and muted content"
              />
            </div>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorPicker 
                label="Block Background" 
                value={appliedTheme.blocks.blockBackground}
                onChange={(value) => handleColorChange('blocks.blockBackground', value)}
                description="Individual block backgrounds"
              />
              <ColorPicker 
                label="Block Hover" 
                value={appliedTheme.blocks.blockHover}
                onChange={(value) => handleColorChange('blocks.blockHover', value)}
                description="Block hover state"
              />
              <ColorPicker 
                label="Block Selected" 
                value={appliedTheme.blocks.blockSelected}
                onChange={(value) => handleColorChange('blocks.blockSelected', value)}
                description="Selected block highlight"
              />
              <ColorPicker 
                label="Snapshot Card Accent" 
                value={appliedTheme.blocks.snapshotCardAccent}
                onChange={(value) => handleColorChange('blocks.snapshotCardAccent', value)}
                description="Snapshot card accent color"
              />
              <ColorPicker 
                label="Heading Accent" 
                value={appliedTheme.blocks.headingAccent}
                onChange={(value) => handleColorChange('blocks.headingAccent', value)}
                description="Heading block accent"
              />
              <ColorPicker 
                label="Figure Accent" 
                value={appliedTheme.blocks.figureAccent}
                onChange={(value) => handleColorChange('blocks.figureAccent', value)}
                description="Figure block accent"
              />
              <ColorPicker 
                label="Table Accent" 
                value={appliedTheme.blocks.tableAccent}
                onChange={(value) => handleColorChange('blocks.tableAccent', value)}
                description="Table block accent"
              />
              <ColorPicker 
                label="Callout Accent" 
                value={appliedTheme.blocks.calloutAccent}
                onChange={(value) => handleColorChange('blocks.calloutAccent', value)}
                description="Callout block accent"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorPicker 
                label="Preview Background" 
                value={appliedTheme.preview.previewBg}
                onChange={(value) => handleColorChange('preview.previewBg', value)}
                description="Main preview area background"
              />
              <ColorPicker 
                label="Preview Card Background" 
                value={appliedTheme.preview.previewCardBg}
                onChange={(value) => handleColorChange('preview.previewCardBg', value)}
                description="Preview content cards"
              />
              <ColorPicker 
                label="Preview Header" 
                value={appliedTheme.preview.previewHeaderBg}
                onChange={(value) => handleColorChange('preview.previewHeaderBg', value)}
                description="Preview header background"
              />
              <ColorPicker 
                label="Preview Border" 
                value={appliedTheme.preview.previewBorder}
                onChange={(value) => handleColorChange('preview.previewBorder', value)}
                description="Preview area borders"
              />
            </div>
          </TabsContent>

          <TabsContent value="palette" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ColorPicker 
                label="Palette Background" 
                value={appliedTheme.palette.paletteBg}
                onChange={(value) => handleColorChange('palette.paletteBg', value)}
                description="Block palette background"
              />
              <ColorPicker 
                label="Palette Card Background" 
                value={appliedTheme.palette.paletteCardBg}
                onChange={(value) => handleColorChange('palette.paletteCardBg', value)}
                description="Individual palette cards"
              />
              <ColorPicker 
                label="Palette Card Hover" 
                value={appliedTheme.palette.paletteCardHover}
                onChange={(value) => handleColorChange('palette.paletteCardHover', value)}
                description="Palette card hover state"
              />
              <ColorPicker 
                label="Category Text" 
                value={appliedTheme.palette.categoryText}
                onChange={(value) => handleColorChange('palette.categoryText', value)}
                description="Category header text"
              />
              <ColorPicker 
                label="Block Title Text" 
                value={appliedTheme.palette.blockTitleText}
                onChange={(value) => handleColorChange('palette.blockTitleText', value)}
                description="Block title color"
              />
              <ColorPicker 
                label="Block Description Text" 
                value={appliedTheme.palette.blockDescText}
                onChange={(value) => handleColorChange('palette.blockDescText', value)}
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
