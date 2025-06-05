
// ABOUTME: Theme preset selection component
// Handles predefined theme switching and customization status

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEME_PRESETS = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Escuro', icon: Moon }
];

interface ThemePresetsProps {
  currentThemeId: string;
  hasCustomizations: boolean;
  onPresetSelect: (themeId: string) => void;
  onResetCustomizations: () => void;
}

export const ThemePresets: React.FC<ThemePresetsProps> = ({
  currentThemeId,
  hasCustomizations,
  onPresetSelect,
  onResetCustomizations
}) => {
  return (
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
            const isActive = currentThemeId === preset.id;
            
            return (
              <Button
                key={preset.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPresetSelect(preset.id)}
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
              onClick={onResetCustomizations}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
