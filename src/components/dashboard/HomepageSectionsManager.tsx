import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

interface HomepageSectionsManagerProps {
  sections: Section[];
  updateSections: (sections: Section[]) => void;
}

const HomepageSectionsManager: React.FC<HomepageSectionsManagerProps> = ({
  sections,
  updateSections
}) => {
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap positions
    [newSections[currentIndex], newSections[targetIndex]] = 
    [newSections[targetIndex], newSections[currentIndex]];

    // Update order numbers
    updateSections(
      newSections.map((section, index) => ({
        ...section,
        order: index
      }))
    );
  };

  const toggleVisibility = (sectionId: string) => {
    updateSections(
      sections.map(section => 
        section.id === sectionId 
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Gerenciar Seções da Página Inicial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map((section) => (
            <div 
              key={section.id}
              className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{section.title}</span>
                <Badge variant={section.visible ? "default" : "outline"}>
                  {section.visible ? "Visível" : "Oculta"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleVisibility(section.id)}
                  title={section.visible ? "Ocultar seção" : "Mostrar seção"}
                >
                  {section.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={section.order === 0}
                  title="Mover para cima"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={section.order === sections.length - 1}
                  title="Mover para baixo"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HomepageSectionsManager;
