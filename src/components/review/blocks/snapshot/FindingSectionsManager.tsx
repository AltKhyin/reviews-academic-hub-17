
// ABOUTME: Manager for finding sections with add/remove and customization
// Handles multiple sections like "Principais Achados", "Principais pontos de atenção", etc.

import React from 'react';
import { InlineTextEditor } from '@/components/editor/inline/InlineTextEditor';
import { InlineColorPicker } from '@/components/editor/inline/InlineColorPicker';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface FindingItem {
  id: string;
  text: string;
  color: string;
}

interface FindingSection {
  id: string;
  label: string;
  items: FindingItem[];
}

interface FindingSectionsManagerProps {
  sections: FindingSection[];
  readonly?: boolean;
  textColor: string;
  onUpdateSections: (sections: FindingSection[]) => void;
}

export const FindingSectionsManager: React.FC<FindingSectionsManagerProps> = ({
  sections,
  readonly = false,
  textColor,
  onUpdateSections
}) => {
  const addSection = () => {
    const newSection: FindingSection = {
      id: `section_${Date.now()}`,
      label: 'Nova Seção',
      items: []
    };
    onUpdateSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    onUpdateSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSectionLabel = (sectionId: string, label: string) => {
    onUpdateSections(sections.map(s => 
      s.id === sectionId ? { ...s, label } : s
    ));
  };

  const addItem = (sectionId: string) => {
    const newItem: FindingItem = {
      id: `item_${Date.now()}`,
      text: '',
      color: '#3b82f6'
    };
    onUpdateSections(sections.map(s => 
      s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
    ));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    onUpdateSections(sections.map(s => 
      s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
    ));
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<FindingItem>) => {
    onUpdateSections(sections.map(s => 
      s.id === sectionId ? {
        ...s, 
        items: s.items.map(i => 
          i.id === itemId ? { ...i, ...updates } : i
        )
      } : s
    ));
  };

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <InlineTextEditor
                value={section.label}
                onChange={(label) => updateSectionLabel(section.id, label)}
                placeholder="Nome da seção..."
                readonly={readonly}
                className="font-semibold text-sm"
                style={{ color: textColor }}
              />
            </div>
            {!readonly && (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => addItem(section.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-700"
                  style={{ color: '#3b82f6', backgroundColor: '#2a2a2a' }}
                >
                  + Item
                </button>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-xs px-2 py-1 rounded hover:bg-red-900 text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  {!readonly && (
                    <InlineColorPicker
                      label="Cor"
                      value={item.color}
                      onChange={(color) => updateItem(section.id, item.id, { color })}
                      readonly={readonly}
                      compact={true}
                      className="w-4 h-4"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <InlineTextEditor
                    value={item.text}
                    onChange={(text) => updateItem(section.id, item.id, { text })}
                    placeholder="Digite um achado importante..."
                    readonly={readonly}
                    className="text-sm text-gray-300"
                  />
                </div>
                {!readonly && (
                  <button
                    onClick={() => removeItem(section.id, item.id)}
                    className="text-xs px-1 py-1 rounded hover:bg-red-900 text-red-400 ml-2"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
            {section.items.length === 0 && readonly && (
              <li className="text-sm text-gray-500 italic">
                Nenhum item especificado nesta seção
              </li>
            )}
          </ul>
        </div>
      ))}

      {!readonly && (
        <div className="pt-2">
          <Button
            onClick={addSection}
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Seção
          </Button>
        </div>
      )}
    </div>
  );
};
