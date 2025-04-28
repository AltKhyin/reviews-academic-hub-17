
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const HomepageSectionsManager = () => {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sections from database
  const { data: dbSections, isLoading } = useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('*')
          .order('order', { ascending: true });
        
        if (error) throw error;
        return data as Section[];
      } catch (error) {
        console.error('Error fetching sections:', error);
        // Return default sections if fetching fails
        return defaultSections;
      }
    }
  });

  // Default sections to use if database has no data
  const defaultSections: Section[] = [
    { id: "reviewer", title: "Notas do Revisor", visible: true, order: 0 },
    { id: "featured", title: "Edições em Destaque", visible: true, order: 1 },
    { id: "upcoming", title: "Próximas Edições", visible: true, order: 2 },
    { id: "recent", title: "Edições Recentes", visible: true, order: 3 },
    { id: "recommended", title: "Recomendados", visible: true, order: 4 },
    { id: "trending", title: "Mais Acessados", visible: true, order: 5 }
  ];

  // Update sections in the database
  const updateSectionsMutation = useMutation({
    mutationFn: async (updatedSections: Section[]) => {
      // First, we need to upsert the sections (insert if not exists, update if exists)
      const upsertPromises = updatedSections.map(section => 
        supabase
          .from('homepage_sections')
          .upsert({ 
            id: section.id,
            title: section.title,
            visible: section.visible,
            order: section.order 
          })
      );

      await Promise.all(upsertPromises);
      return updatedSections;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast({
        title: "Seções atualizadas",
        description: "As alterações foram salvas com sucesso."
      });
    },
    onError: (error) => {
      console.error('Failed to update sections:', error);
      toast({
        title: "Erro ao atualizar seções",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive"
      });
    }
  });

  // Initialize sections state with data from database or defaults
  useEffect(() => {
    if (dbSections) {
      if (dbSections.length > 0) {
        setSections(dbSections);
      } else {
        setSections(defaultSections);
        // If no sections found in the DB, initialize with defaults
        updateSectionsMutation.mutate(defaultSections);
      }
      setLoading(false);
    }
  }, [dbSections]);

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const newSections = [...sections];
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
    
    setSections(updatedSections);
    updateSectionsMutation.mutate(updatedSections);
  };

  const toggleVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    );
    
    setSections(updatedSections);
    updateSectionsMutation.mutate(updatedSections);
  };

  if (loading || isLoading) {
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
