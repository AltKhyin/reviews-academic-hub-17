
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useSectionVisibility, Section } from '@/hooks/useSectionVisibility';
import { SECTION_REGISTRY, getSectionById } from '@/config/sections';

const HomepageSectionsManager = () => {
  const { 
    sections, 
    isLoading, 
    updateSection, 
    reorderSections, 
    toggleSectionVisibility,
    resetToDefaults,
    getAllSections 
  } = useSectionVisibility();
  
  // Ensure sections is always an array
  const safeSections = Array.isArray(sections) ? sections : [];
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize local state with sections from the hook - prevent infinite loops
  useEffect(() => {
    if (Array.isArray(sections) && sections.length > 0 && !isInitialized) {
      const sortedSections = getAllSections();
      const safeSortedSections = Array.isArray(sortedSections) ? sortedSections : [];
      setLocalSections([...safeSortedSections]);
      setIsInitialized(true);
      console.log('HomepageSectionsManager: Loaded sections', safeSortedSections);
    }
  }, [sections, getAllSections, isInitialized]);

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = localSections.findIndex(s => s.id === sectionId);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === localSections.length - 1) ||
      currentIndex === -1
    ) {
      return;
    }

    const newSections = [...localSections];
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
    
    // Save the new order
    const newOrder = updatedSections.map(s => s.id);
    reorderSections(newOrder);
    
    toast({
      title: "Seções atualizadas",
      description: "A ordem das seções foi alterada com sucesso.",
    });

    console.log('HomepageSectionsManager: Reordered sections', updatedSections);
  };

  const handleToggleVisibility = (sectionId: string) => {
    const section = localSections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedSections = localSections.map(s => 
      s.id === sectionId 
        ? { ...s, visible: !s.visible }
        : s
    );
    
    setLocalSections(updatedSections);
    toggleSectionVisibility(sectionId);
    
    const toggledSection = updatedSections.find(s => s.id === sectionId);
    
    toast({
      title: "Seção atualizada",
      description: `Seção "${toggledSection?.title}" ${toggledSection?.visible ? 'mostrada' : 'ocultada'} com sucesso.`,
    });

    console.log('HomepageSectionsManager: Toggled visibility for', sectionId, 'to', toggledSection?.visible);
  };

  const handleReset = () => {
    resetToDefaults();
    setIsInitialized(false); // Allow re-initialization after reset
    toast({
      title: "Configurações restauradas",
      description: "As seções foram restauradas para a configuração padrão.",
    });
    console.log('HomepageSectionsManager: Reset to defaults');
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Seções da Página Inicial</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure a visibilidade e ordem das seções da página inicial
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrão
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localSections.map((section, index) => {
            const sectionDef = getSectionById(section.id);
            
            return (
              <div 
                key={section.id}
                className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{section.title}</span>
                  <Badge variant={section.visible ? "default" : "outline"}>
                    {section.visible ? "Visível" : "Oculta"}
                  </Badge>
                  {sectionDef?.adminOnly && (
                    <Badge variant="secondary" className="text-xs">
                      Admin/Editor
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Ordem: {section.order}
                  </Badge>
                  {sectionDef?.description && (
                    <span className="text-xs text-muted-foreground" title={sectionDef.description}>
                      ℹ️
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleToggleVisibility(section.id)}
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
            );
          })}
          
          {localSections.length === 0 && !isLoading && (
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
