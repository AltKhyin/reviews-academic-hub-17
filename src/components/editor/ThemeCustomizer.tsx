
// ABOUTME: Theme customization panel with real-time preview and preset management
// Provides comprehensive color customization for the native editor

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';
import { 
  X, 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Sun, 
  Moon, 
  Monitor,
  Sparkles
} from 'lucide-react';
import { useEditorTheme } from '@/contexts/EditorThemeContext';
import { EditorTheme } from '@/types/theme';
import { cn } from '@/lib/utils';

interface ThemeCustomizerProps {
  onClose: () => void;
}

interface ColorSection {
  key: string;
  label: string;
  colors: { key: string; label: string; description?: string }[];
}

const COLOR_SECTIONS: ColorSection[] = [
  {
    key: 'editor',
    label: 'Editor Principal',
    colors: [
      { key: 'primaryBg', label: 'Fundo Principal', description: 'Cor de fundo principal do editor' },
      { key: 'secondaryBg', label: 'Fundo Secundário', description: 'Painéis laterais e seções' },
      { key: 'cardBg', label: 'Fundo dos Cards', description: 'Cartões e elementos elevados' },
      { key: 'hoverBg', label: 'Fundo Hover', description: 'Estado de hover dos elementos' },
      { key: 'selectedBg', label: 'Fundo Selecionado', description: 'Elementos selecionados/ativos' },
      { key: 'primaryBorder', label: 'Borda Principal', description: 'Bordas padrão' },
      { key: 'focusBorder', label: 'Borda de Foco', description: 'Elementos focados' }
    ]
  },
  {
    key: 'text',
    label: 'Texto e Tipografia',
    colors: [
      { key: 'primaryText', label: 'Texto Principal', description: 'Cor principal do texto' },
      { key: 'secondaryText', label: 'Texto Secundário', description: 'Texto de apoio' },
      { key: 'mutedText', label: 'Texto Esmaecido', description: 'Placeholders e hints' },
      { key: 'accentText', label: 'Texto de Destaque', description: 'Links e elementos importantes' },
      { key: 'linkText', label: 'Texto de Links', description: 'Links e elementos clicáveis' }
    ]
  },
  {
    key: 'interactive',
    label: 'Elementos Interativos',
    colors: [
      { key: 'buttonPrimary', label: 'Botão Principal', description: 'Botões de ação primária' },
      { key: 'buttonPrimaryHover', label: 'Botão Principal Hover', description: 'Estado hover dos botões' },
      { key: 'buttonSecondary', label: 'Botão Secundário', description: 'Botões secundários' },
      { key: 'successColor', label: 'Cor de Sucesso', description: 'Mensagens de sucesso' },
      { key: 'warningColor', label: 'Cor de Aviso', description: 'Mensagens de aviso' },
      { key: 'errorColor', label: 'Cor de Erro', description: 'Mensagens de erro' }
    ]
  }
];

const THEME_PRESETS = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Escuro', icon: Moon }
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose }) => {
  const { 
    currentTheme, 
    appliedTheme, 
    availableThemes,
    customizations,
    setTheme, 
    customizeColor,
    resetCustomizations,
    exportTheme,
    importTheme
  } = useEditorTheme();

  const [activeSection, setActiveSection] = useState<string>('editor');
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filtered colors for performance
  const filteredColors = useMemo(() => {
    if (!searchTerm) return COLOR_SECTIONS;
    
    return COLOR_SECTIONS.map(section => ({
      ...section,
      colors: section.colors.filter(color => 
        color.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(section => section.colors.length > 0);
  }, [searchTerm]);

  // Get current color value with fallback
  const getCurrentColorValue = useCallback((sectionKey: string, colorKey: string): string => {
    const fullPath = `${sectionKey}.${colorKey}`;
    const sectionColors = appliedTheme[sectionKey as keyof EditorTheme] as any;
    return sectionColors?.[colorKey] || '#000000';
  }, [appliedTheme]);

  // Handle color change with debouncing for performance
  const handleColorChange = useCallback((sectionKey: string, colorKey: string, value: string) => {
    const fullPath = `${sectionKey}.${colorKey}`;
    customizeColor(fullPath, value);
  }, [customizeColor]);

  // Handle theme preset selection
  const handlePresetSelect = useCallback((themeId: string) => {
    setTheme(themeId);
  }, [setTheme]);

  // Handle export
  const handleExport = useCallback(() => {
    try {
      const exportData = exportTheme();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${currentTheme.name.toLowerCase()}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export theme:', error);
    }
  }, [exportTheme, currentTheme.name]);

  // Handle import
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importTheme(content);
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Erro ao importar tema. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [importTheme]);

  const hasCustomizations = Object.keys(customizations).length > 0;

  return (
    <div className="theme-customizer h-full flex flex-col">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          backgroundColor: 'var(--editor-secondary-bg)',
          borderColor: 'var(--editor-primary-border)'
        }}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" style={{ color: 'var(--editor-accent-text)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--editor-primary-text)' }}>
            Personalizar Tema
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Theme Presets */}
          <Card style={{ backgroundColor: 'var(--editor-card-bg)', borderColor: 'var(--editor-primary-border)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm" style={{ color: 'var(--editor-primary-text)' }}>
                Temas Predefinidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = currentTheme.id === preset.id;
                  
                  return (
                    <Button
                      key={preset.id}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={cn("flex items-center gap-2", isActive && "ring-2 ring-[var(--editor-focus-border)]")}
                      style={{
                        backgroundColor: isActive ? 'var(--editor-button-primary)' : 'var(--editor-card-bg)',
                        borderColor: 'var(--editor-primary-border)',
                        color: 'var(--editor-primary-text)'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {preset.name}
                    </Button>
                  );
                })}
              </div>
              
              {hasCustomizations && (
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Personalizado
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetCustomizations}
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Resetar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color Sections */}
          <Card style={{ backgroundColor: 'var(--editor-card-bg)', borderColor: 'var(--editor-primary-border)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm" style={{ color: 'var(--editor-primary-text)' }}>
                Cores do Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Section Tabs */}
              <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--editor-secondary-bg)' }}>
                {COLOR_SECTIONS.map((section) => (
                  <Button
                    key={section.key}
                    variant={activeSection === section.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveSection(section.key)}
                    className="flex-1 text-xs"
                    style={{
                      backgroundColor: activeSection === section.key 
                        ? 'var(--editor-button-primary)' 
                        : 'transparent',
                      color: 'var(--editor-primary-text)'
                    }}
                  >
                    {section.label}
                  </Button>
                ))}
              </div>

              {/* Color Controls */}
              {filteredColors
                .filter(section => section.key === activeSection)
                .map((section) => (
                  <div key={section.key} className="space-y-3">
                    {section.colors.map((color) => (
                      <div key={color.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label 
                            className="text-xs font-medium"
                            style={{ color: 'var(--editor-primary-text)' }}
                          >
                            {color.label}
                          </Label>
                          <div
                            className="w-6 h-6 rounded border"
                            style={{
                              backgroundColor: getCurrentColorValue(section.key, color.key),
                              borderColor: 'var(--editor-primary-border)'
                            }}
                          />
                        </div>
                        {color.description && (
                          <p className="text-xs" style={{ color: 'var(--editor-muted-text)' }}>
                            {color.description}
                          </p>
                        )}
                        <ColorPicker
                          value={getCurrentColorValue(section.key, color.key)}
                          onChange={(value) => handleColorChange(section.key, color.key, value)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Import/Export */}
          <Card style={{ backgroundColor: 'var(--editor-card-bg)', borderColor: 'var(--editor-primary-border)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm" style={{ color: 'var(--editor-primary-text)' }}>
                Importar/Exportar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                  style={{
                    borderColor: 'var(--editor-primary-border)',
                    color: 'var(--editor-primary-text)',
                    backgroundColor: 'var(--editor-card-bg)'
                  }}
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full"
                    style={{
                      borderColor: 'var(--editor-primary-border)',
                      color: 'var(--editor-primary-text)',
                      backgroundColor: 'var(--editor-card-bg)'
                    }}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4" />
                      Importar
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs" style={{ color: 'var(--editor-muted-text)' }}>
                Salve ou carregue suas personalizações de tema
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
