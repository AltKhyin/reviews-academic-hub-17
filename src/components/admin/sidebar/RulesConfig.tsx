
// ABOUTME: Community rules configuration component
// Handles rule creation, editing, and removal

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { SidebarConfig } from '@/types/sidebar';

interface RulesConfigProps {
  config: SidebarConfig;
  onConfigChange: (updates: Partial<SidebarConfig>) => void;
}

export const RulesConfig: React.FC<RulesConfigProps> = ({
  config,
  onConfigChange
}) => {
  const addRule = () => {
    onConfigChange({
      rules: [...config.rules, 'Nova regra da comunidade']
    });
  };

  const removeRule = (index: number) => {
    const updatedRules = config.rules.filter((_, i) => i !== index);
    onConfigChange({ rules: updatedRules });
  };

  const updateRule = (index: number, value: string) => {
    const updatedRules = config.rules.map((rule, i) =>
      i === index ? value : rule
    );
    onConfigChange({ rules: updatedRules });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras da Comunidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.rules.map((rule, index) => (
          <div key={index} className="space-y-2">
            <Textarea
              value={rule}
              onChange={(e) => updateRule(index, e.target.value)}
              placeholder={`Regra ${index + 1}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeRule(index)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addRule} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Regra
        </Button>
      </CardContent>
    </Card>
  );
};
