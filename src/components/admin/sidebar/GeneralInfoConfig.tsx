
// ABOUTME: General information configuration component
// Handles tagline and next review timestamp settings

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SidebarConfig } from '@/types/sidebar';

interface GeneralInfoConfigProps {
  config: SidebarConfig;
  onConfigChange: (updates: Partial<SidebarConfig>) => void;
}

export const GeneralInfoConfig: React.FC<GeneralInfoConfigProps> = ({
  config,
  onConfigChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tagline">Tagline da Comunidade</Label>
          <Textarea
            id="tagline"
            value={config.tagline}
            onChange={(e) => onConfigChange({ tagline: e.target.value })}
            placeholder="Digite o tagline da comunidade..."
          />
        </div>
        <div>
          <Label htmlFor="next-review">Próxima Review (ISO String)</Label>
          <Input
            id="next-review"
            value={config.nextReviewTs}
            onChange={(e) => onConfigChange({ nextReviewTs: e.target.value })}
            placeholder="2024-01-15T10:00:00Z"
          />
        </div>
      </CardContent>
    </Card>
  );
};
