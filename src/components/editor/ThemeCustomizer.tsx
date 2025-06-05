
// ABOUTME: Theme customization panel with real-time preview and preset management
// Provides comprehensive color customization for the native editor

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Palette } from 'lucide-react';
import { useEditorTheme } from '@/contexts/EditorThemeContext';
import { EditorTheme } from '@/types/theme';
import { ThemePresets } from './theme/ThemePresets';
import { ColorSection } from './theme/ColorSection';
import { ImportExportControls } from './theme/ImportExportControls';

interface ThemeCustomizerProps {
  onClose: () => void;
}

interface ColorSectionConfig {
  key: string;
  label: string;
  colors: { key: string; label: string; description?: string }[];
}

const COLOR_SECTIONS: ColorSectionConfig[] = [
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

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose }) => {
  const { 
    currentTheme, 
    appliedTheme, 
    customizations,
    setTheme, 
    customizeColor,
    resetCustomizations,
    exportTheme,
    importTheme
  } = useEditorTheme();

  const [activeSection, setActiveSection] = useState<string>('editor');

  const getCurrentColorValue = useCallback((sectionKey: string, colorKey: string): string => {
    const sectionColors = appliedTheme[sectionKey as keyof EditorTheme] as any;
    return sectionColors?.[colorKey] || '#000000';
  }, [appliedTheme]);

  const handleColorChange = useCallback((sectionKey: string, colorKey: string, value: string) => {
    const fullPath = `${sectionKey}.${colorKey}`;
    customizeColor(fullPath, value);
  }, [customizeColor]);

  const handlePresetSelect = useCallback((themeId: string) => {
    setTheme(themeId);
  }, [setTheme]);

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
          <ThemePresets
            currentThemeId={currentTheme.id}
            hasCustomizations={hasCustomizations}
            onPresetSelect={handlePresetSelect}
            onResetCustomizations={resetCustomizations}
          />

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
              {COLOR_SECTIONS
                .filter(section => section.key === activeSection)
                .map((section) => (
                  <ColorSection
                    key={section.key}
                    colors={section.colors}
                    sectionKey={section.key}
                    getCurrentColorValue={getCurrentColorValue}
                    onColorChange={handleColorChange}
                  />
                ))}
            </CardContent>
          </Card>

          {/* Import/Export */}
          <ImportExportControls
            currentThemeName={currentTheme.name}
            onExport={exportTheme}
            onImport={importTheme}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
