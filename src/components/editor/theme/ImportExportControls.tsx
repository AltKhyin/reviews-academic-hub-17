
// ABOUTME: Theme import/export controls component
// Handles theme configuration file operations

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

interface ImportExportControlsProps {
  currentThemeName: string;
  onExport: () => string;
  onImport: (themeData: string) => void;
}

export const ImportExportControls: React.FC<ImportExportControlsProps> = ({
  currentThemeName,
  onExport,
  onImport
}) => {
  const handleExport = useCallback(() => {
    try {
      const exportData = onExport();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${currentThemeName.toLowerCase()}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export theme:', error);
    }
  }, [onExport, currentThemeName]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onImport(content);
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Erro ao importar tema. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  }, [onImport]);

  return (
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
  );
};
