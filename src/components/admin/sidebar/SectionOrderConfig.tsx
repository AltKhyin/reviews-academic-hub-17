
// ABOUTME: Section order and visibility configuration component
// Handles drag-and-drop reordering and section enable/disable

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { SidebarConfig } from '@/types/sidebar';

interface SectionOrderConfigProps {
  config: SidebarConfig;
  onConfigChange: (updates: Partial<SidebarConfig>) => void;
}

export const SectionOrderConfig: React.FC<SectionOrderConfigProps> = ({
  config,
  onConfigChange
}) => {
  const handleSectionToggle = (sectionId: string) => {
    const updatedSections = config.sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    onConfigChange({ sections: updatedSections });
  };

  const handleSectionReorder = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(config.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedSections = items.map((item, index) => ({
      ...item,
      order: index
    }));

    onConfigChange({ sections: updatedSections });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordem e Visibilidade das Seções</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleSectionReorder}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {config.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="flex-1 font-medium">{section.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSectionToggle(section.id)}
                          >
                            {section.enabled ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};
