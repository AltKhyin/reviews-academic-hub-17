
// ABOUTME: Simplified theme customizer focusing on essential editor colors
// Provides intuitive color customization with curated presets and better UX

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { 
  Palette, 
  RotateCcw, 
  Sun, 
  Moon, 
  Monitor,
  Copy,
  Check,
  Upload
} from 'lucide-react';
import { useEditorTheme } from '@/contexts/EditorThemeContext';
import { cn } from '@/lib/utils';

interface ThemeCustomizerProps {
  onClose?: () => void;
  className?: string;
}

// Curated theme presets for different use cases
const THEME_PRESETS = {
  'Light Themes': [
    {
      name: 'Clean Light',
      description: 'Minimal and clean',
      colors: {
        primaryBg: '#ffffff',
        secondaryBg: '#f8f9fa',
        cardBg: '#ffffff',
        primaryText: '#1a1a1a',
        secondaryText: '#6b7280',
        primaryBorder: '#e5e7eb',
        buttonPrimary: '#3b82f6',
        buttonSecondary: '#f3f4f6'
      }
    },
    {
      name: 'Warm Light',
      description: 'Warm and welcoming',
      colors: {
        primaryBg: '#fffef9',
        secondaryBg: '#fef3e2',
        cardBg: '#ffffff',
        primaryText: '#292524',
        secondaryText: '#78716c',
        primaryBorder: '#e7e5e4',
        buttonPrimary: '#ea580c',
        buttonSecondary: '#fed7aa'
      }
    },
    {
      name: 'Cool Light',
      description: 'Cool and professional',
      colors: {
        primaryBg: '#f8fafc',
        secondaryBg: '#f1f5f9',
        cardBg: '#ffffff',
        primaryText: '#0f172a',
        secondaryText: '#64748b',
        primaryBorder: '#e2e8f0',
        buttonPrimary: '#0ea5e9',
        buttonSecondary: '#e0f2fe'
      }
    }
  ],
  'Dark Themes': [
    {
      name: 'Pure Dark',
      description: 'Deep and focused',
      colors: {
        primaryBg: '#0a0a0a',
        secondaryBg: '#1a1a1a',
        cardBg: '#262626',
        primaryText: '#fafafa',
        secondaryText: '#a3a3a3',
        primaryBorder: '#404040',
        buttonPrimary: '#ffffff',
        buttonSecondary: '#404040'
      }
    },
    {
      name: 'Slate Dark',
      description: 'Balanced and modern',
      colors: {
        primaryBg: '#0f0f23',
        secondaryBg: '#1e1e3a',
        cardBg: '#2a2a4a',
        primaryText: '#e2e8f0',
        secondaryText: '#94a3b8',
        primaryBorder: '#475569',
        buttonPrimary: '#60a5fa',
        buttonSecondary: '#334155'
      }
    },
    {
      name: 'Emerald Dark',
      description: 'Calm and nature-inspired',
      colors: {
        primaryBg: '#022c22',
        secondaryBg: '#064e3b',
        cardBg: '#065f46',
        primaryText: '#ecfdf5',
        secondaryText: '#a7f3d0',
        primaryBorder: '#047857',
        buttonPrimary: '#10b981',
        buttonSecondary: '#134e4a'
      }
    }
  ],
  'High Contrast': [
    {
      name: 'High Contrast Light',
      description: 'Maximum readability',
      colors: {
        primaryBg: '#ffffff',
        secondaryBg: '#f5f5f5',
        cardBg: '#ffffff',
        primaryText: '#000000',
        secondaryText: '#333333',
        primaryBorder: '#000000',
        buttonPrimary: '#000000',
        buttonSecondary: '#e5e5e5'
      }
    },
    {
      name: 'High Contrast Dark',
      description: 'Bold and accessible',
      colors: {
        primaryBg: '#000000',
        secondaryBg: '#1a1a1a',
        cardBg: '#2a2a2a',
        primaryText: '#ffffff',
        secondaryText: '#cccccc',
        primaryBorder: '#666666',
        buttonPrimary: '#ffffff',
        buttonSecondary: '#444444'
      }
    }
  ]
};

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
    customizeColor(`editor.${path}`, value);
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

  const applyPreset = (preset: any) => {
    Object.entries(preset.colors).forEach(([key, value]) => {
      customizeColor(`editor.${key}`, value as string);
    });
  };

  const getButtonStyle = (isActive: boolean) => ({
    backgroundColor: isActive 
      ? 'var(--editor-button-primary)' 
      : 'var(--editor-button-secondary)',
    borderColor: 'var(--editor-primary-border)',
    color: isActive 
      ? 'var(--editor-card-bg)' 
      : 'var(--editor-primary-text)'
  });

  return (
    <Card className={cn("theme-customizer h-full", className)} style={{
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              style={{
                color: 'var(--editor-primary-text)',
                backgroundColor: 'transparent'
              }}
              className="hover:bg-[var(--editor-hover-bg)]"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 overflow-y-auto">
        {/* Base Theme Selection */}
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
                className="justify-start hover:scale-105 transition-transform"
                style={getButtonStyle(currentTheme.id === theme.id)}
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
                className="hover:scale-105 transition-transform"
                style={getButtonStyle(themeMode === mode)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />

        {/* Theme Presets */}
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
            Color Presets
          </Label>
          <div className="space-y-4">
            {Object.entries(THEME_PRESETS).map(([category, presets]) => (
              <div key={category} className="space-y-2">
                <div className="text-xs font-medium text-[var(--editor-muted-text)] uppercase tracking-wider">
                  {category}
                </div>
                <div className="grid gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="p-3 h-auto text-left hover:scale-102 transition-transform"
                      onClick={() => applyPreset(preset)}
                      style={{
                        backgroundColor: 'var(--editor-surface-bg)',
                        borderColor: 'var(--editor-primary-border)',
                        color: 'var(--editor-primary-text)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ 
                              backgroundColor: preset.colors.primaryBg,
                              borderColor: 'var(--editor-primary-border)'
                            }}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ 
                              backgroundColor: preset.colors.cardBg,
                              borderColor: 'var(--editor-primary-border)'
                            }}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ 
                              backgroundColor: preset.colors.buttonPrimary,
                              borderColor: 'var(--editor-primary-border)'
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{preset.name}</div>
                          <div className="text-xs text-[var(--editor-muted-text)]">{preset.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />

        {/* Custom Colors */}
        <div>
          <Label className="text-sm font-medium text-[var(--editor-primary-text)] mb-3 block">
            Custom Colors
          </Label>
          <div className="grid gap-4">
            <ColorPicker 
              label="Background" 
              value={appliedTheme.editor.primaryBg}
              onChange={(value) => handleColorChange('primaryBg', value)}
              description="Main editor background"
            />
            <ColorPicker 
              label="Surface" 
              value={appliedTheme.editor.cardBg}
              onChange={(value) => handleColorChange('cardBg', value)}
              description="Cards and panels"
            />
            <ColorPicker 
              label="Primary Text" 
              value={appliedTheme.editor.primaryText}
              onChange={(value) => handleColorChange('primaryText', value)}
              description="Main text color"
            />
            <ColorPicker 
              label="Secondary Text" 
              value={appliedTheme.editor.secondaryText}
              onChange={(value) => handleColorChange('secondaryText', value)}
              description="Labels and descriptions"
            />
            <ColorPicker 
              label="Border" 
              value={appliedTheme.editor.primaryBorder}
              onChange={(value) => handleColorChange('primaryBorder', value)}
              description="Borders and dividers"
            />
            <ColorPicker 
              label="Primary Button" 
              value={appliedTheme.editor.buttonPrimary}
              onChange={(value) => handleColorChange('buttonPrimary', value)}
              description="Action buttons"
            />
          </div>
        </div>

        <Separator style={{ borderColor: 'var(--editor-primary-border)' }} />

        {/* Import/Export & Actions */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetCustomizations}
              className="flex-1 hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'var(--editor-button-secondary)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="flex-1 hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'var(--editor-button-secondary)',
                borderColor: 'var(--editor-primary-border)',
                color: 'var(--editor-primary-text)'
              }}
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
                style={{
                  backgroundColor: 'var(--editor-surface-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleImport}
                disabled={!importData.trim()}
                style={{
                  backgroundColor: importData.trim() ? 'var(--editor-button-secondary)' : 'var(--editor-hover-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: importData.trim() ? 'var(--editor-primary-text)' : 'var(--editor-muted-text)'
                }}
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
              <Badge 
                variant="outline" 
                style={{ 
                  backgroundColor: 'var(--editor-card-bg)',
                  borderColor: 'var(--editor-primary-border)',
                  color: 'var(--editor-primary-text)'
                }}
              >
                {Object.keys(customizations).length} customization(s) applied
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
