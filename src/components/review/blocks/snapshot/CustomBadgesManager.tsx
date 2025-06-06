
// ABOUTME: Manager for custom badges with add/remove and color customization
// Replaces hardcoded evidence levels and recommendation strengths

import React from 'react';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineColorPicker } from '@/components/editor/inline/InlineColorPicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface CustomBadge {
  id: string;
  label: string;
  value: string;
  color: string;
  background_color: string;
}

interface CustomBadgesManagerProps {
  badges: CustomBadge[];
  readonly?: boolean;
  onUpdateBadges: (badges: CustomBadge[]) => void;
}

export const CustomBadgesManager: React.FC<CustomBadgesManagerProps> = ({
  badges,
  readonly = false,
  onUpdateBadges
}) => {
  const addBadge = () => {
    const newBadge: CustomBadge = {
      id: `badge_${Date.now()}`,
      label: 'Novo Badge',
      value: 'Valor',
      color: '#3b82f6',
      background_color: 'transparent'
    };
    onUpdateBadges([...badges, newBadge]);
  };

  const removeBadge = (badgeId: string) => {
    onUpdateBadges(badges.filter(b => b.id !== badgeId));
  };

  const updateBadge = (badgeId: string, updates: Partial<CustomBadge>) => {
    onUpdateBadges(badges.map(b => 
      b.id === badgeId ? { ...b, ...updates } : b
    ));
  };

  return (
    <div className="space-y-4">
      {/* Badge Editor (only in edit mode) */}
      {!readonly && badges.length > 0 && (
        <div className="space-y-3 p-3 border border-gray-700 rounded-lg">
          <h5 className="text-sm font-medium text-gray-300">Editar Badges</h5>
          {badges.map((badge) => (
            <div key={badge.id} className="grid grid-cols-2 gap-2 p-2 bg-gray-800 rounded">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rótulo</label>
                <InlineTextEditor
                  value={badge.label}
                  onChange={(label) => updateBadge(badge.id, { label })}
                  placeholder="Rótulo do badge..."
                  readonly={readonly}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Valor</label>
                <InlineTextEditor
                  value={badge.value}
                  onChange={(value) => updateBadge(badge.id, { value })}
                  placeholder="Valor do badge..."
                  readonly={readonly}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Cor do Texto</label>
                <InlineColorPicker
                  label="Texto"
                  value={badge.color}
                  onChange={(color) => updateBadge(badge.id, { color })}
                  readonly={readonly}
                  compact={true}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Cor de Fundo</label>
                <InlineColorPicker
                  label="Fundo"
                  value={badge.background_color}
                  onChange={(background_color) => updateBadge(badge.id, { background_color })}
                  readonly={readonly}
                  compact={true}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => removeBadge(badge.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-red-900 text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Badge Button (only in edit mode) */}
      {!readonly && (
        <div>
          <Button
            onClick={addBadge}
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Badge
          </Button>
        </div>
      )}

      {/* Badge Display */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
          {badges.map((badge) => (
            <Badge
              key={badge.id}
              variant="outline"
              className="px-3 py-1"
              style={{
                backgroundColor: badge.background_color,
                borderColor: badge.color,
                color: badge.color
              }}
            >
              {badge.label}: {badge.value}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
