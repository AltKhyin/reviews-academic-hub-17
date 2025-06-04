
// ABOUTME: Changelog configuration component
// Handles changelog entries creation, editing, and visibility

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SidebarConfig } from '@/types/sidebar';

interface ChangelogConfigProps {
  config: SidebarConfig;
  onConfigChange: (updates: Partial<SidebarConfig>) => void;
}

export const ChangelogConfig: React.FC<ChangelogConfigProps> = ({
  config,
  onConfigChange
}) => {
  const addChangelogEntry = () => {
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      text: 'Nova entrada do changelog'
    };
    onConfigChange({
      changelog: {
        ...config.changelog,
        entries: [...config.changelog.entries, newEntry]
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changelog</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-changelog"
            checked={config.changelog.show}
            onCheckedChange={(checked) =>
              onConfigChange({
                changelog: { ...config.changelog, show: checked },
              })
            }
          />
          <Label htmlFor="show-changelog">Mostrar Changelog</Label>
        </div>

        {config.changelog.entries.map((entry, index) => (
          <div key={index} className="space-y-2 border rounded-md p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`changelog-date-${index}`}>Data</Label>
                <Input
                  id={`changelog-date-${index}`}
                  type="date"
                  value={entry.date}
                  onChange={(e) => {
                    const updatedEntries = config.changelog.entries.map(
                      (item, i) =>
                        i === index ? { ...item, date: e.target.value } : item
                    );
                    onConfigChange({
                      changelog: { ...config.changelog, entries: updatedEntries },
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`changelog-text-${index}`}>Texto</Label>
                <Input
                  id={`changelog-text-${index}`}
                  value={entry.text}
                  onChange={(e) => {
                    const updatedEntries = config.changelog.entries.map(
                      (item, i) =>
                        i === index ? { ...item, text: e.target.value } : item
                    );
                    onConfigChange({
                      changelog: { ...config.changelog, entries: updatedEntries },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addChangelogEntry} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Entrada
        </Button>
      </CardContent>
    </Card>
  );
};
