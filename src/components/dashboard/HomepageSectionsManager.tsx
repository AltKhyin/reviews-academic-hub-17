
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useSectionVisibility, Section } from '@/hooks/useSectionVisibility';

const HomepageSectionsManager = () => {
  const { sections, isLoading, saveSections } = useSectionVisibility();
  const [localSections, setLocalSections] = useState<Section[]>([]);

  // Initialize local state with sections from the hook
  useEffect(() => {
    if (sections && sections.length > 0) {
      setLocalSections([...sections].sort((a, b) => a.order - b.order));
    }
  }, [sections]);

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const newSections = [...localSections];
    const currentIndex = newSections.findIndex(s => s.id === sectionId);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === newSections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap positions
    [newSections[currentIndex], newSections[targetIndex]] = 
    [newSections[targetIndex], newSections[currentIndex]];

    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setLocalSections(updatedSections);
    saveSections(updatedSections);
    
    toast({
      title: "Seções atualizadas",
      description: "A ordem das seções foi alterada com sucesso.",
    });
  };

  const toggleVisibility = (sectionId: string) => {
    const updatedSections = localSections.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    );
    
    setLocalSections(updatedSections);
    saveSections(updatedSections);
    
    const toggledSection = updatedSections.find(s => s.id === sectionId);
    
    toast({
      title: "Seção atualizada",
      description: `Seção "${toggledSection?.title}" ${toggledSection?.visible ? 'mostrada' : 'ocultada'} com sucesso.`,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Gerenciar Seções da Página Inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Gerenciar Seções da Página Inicial</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure a visibilidade e ordem das seções da página inicial
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localSections.map((section, index) => (
            <div 
              key={section.id}
              className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{section.title}</span>
                <Badge variant={section.visible ? "default" : "outline"}>
                  {section.visible ? "Visível" : "Oculta"}
                </Badge>
                {section.id === "reviews" && (
                  <Badge variant="secondary" className="text-xs">
                    Admin/Editor
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleVisibility(section.id)}
                  title={section.visible ? "Ocultar seção" : "Mostrar seção"}
                  className="h-8 w-8"
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
                  disabled={index === 0}
                  title="Mover para cima"
                  className="h-8 w-8"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={index === localSections.length - 1}
                  title="Mover para baixo"
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {localSections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma seção configurada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HomepageSectionsManager;
