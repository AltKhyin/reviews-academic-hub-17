// ABOUTME: Comprehensive homepage management interface with unified section schema
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, Calendar, Clock, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { useUpcomingReleaseSettings } from '@/hooks/useUpcomingReleaseSettings';

interface LocalReleaseSettings {
  customDate: string;
  customTime: string;
  isRecurring: boolean;
  recurringPattern: 'weekly' | 'biweekly';
  recurringDays: string[];
  recurringTime: string;
  wipeSuggestions: boolean;
}

export const HomepageManager = () => {
  const { 
    sections, 
    isLoading, 
    toggleSectionVisibility,
    reorderSections, 
    resetToDefaults,
    getAllSections 
  } = useSectionVisibility();
  
  const {
    settings,
    isLoading: settingsLoading,
    updateSettings,
    getNextReleaseDate
  } = useUpcomingReleaseSettings();
  
  const [localSections, setLocalSections] = useState(sections);
  const [releaseSettings, setReleaseSettings] = useState<LocalReleaseSettings>({
    customDate: '',
    customTime: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringDays: [],
    recurringTime: '10:00',
    wipeSuggestions: true
  });

  // Initialize local state
  useEffect(() => {
    if (sections && sections.length > 0) {
      const sortedSections = getAllSections();
      setLocalSections([...sortedSections]);
      console.log('HomepageManager: Loaded sections from hook:', sortedSections);
    }
  }, [sections, getAllSections]);

  // Initialize release settings
  useEffect(() => {
    if (settings) {
      setReleaseSettings(prev => ({
        ...prev,
        customDate: settings.customDate || '',
        customTime: settings.customTime || '',
        isRecurring: settings.isRecurring || false,
        recurringPattern: settings.recurringPattern || 'weekly',
        recurringDays: settings.recurringDays || [],
        recurringTime: settings.recurringTime || '10:00',
        wipeSuggestions: settings.wipeSuggestions !== false
      }));
    }
  }, [settings]);

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
    
    [newSections[currentIndex], newSections[targetIndex]] = 
    [newSections[targetIndex], newSections[currentIndex]];

    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setLocalSections(updatedSections);
    
    const newOrder = updatedSections.map(s => s.id);
    reorderSections(newOrder);
    
    toast({
      title: "Seções atualizadas",
      description: "A ordem das seções foi alterada com sucesso.",
    });
    
    console.log('HomepageManager: Reordered sections to:', updatedSections.map(s => `${s.id} (order: ${s.order})`));
  };

  const handleToggleVisibility = (sectionId: string) => {
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
    
    console.log('HomepageManager: Toggled visibility for', sectionId, 'to', toggledSection?.visible);
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Configurações restauradas",
      description: "As seções foram restauradas para a configuração padrão.",
    });
    console.log('HomepageManager: Reset to defaults');
  };

  const handleSaveReleaseSettings = async () => {
    try {
      await updateSettings(releaseSettings);
      toast({
        title: "Configurações salvas",
        description: "As configurações de próximas edições foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleRecurringDayToggle = (day: string) => {
    setReleaseSettings(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const nextReleaseDate = getNextReleaseDate();

  if (isLoading || settingsLoading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Homepage Manager</CardTitle>
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
        <CardTitle>Homepage Manager</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure seções, próximas edições e outros aspectos da página inicial
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections">Gerenciar Seções</TabsTrigger>
            <TabsTrigger value="releases">Próximas Edições</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Seções da Homepage</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar Padrão
              </Button>
            </div>
            
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
                    <Badge variant="secondary" className="text-xs">
                      Ordem: {section.order}
                    </Badge>
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
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="releases" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuração de Próximas Edições</h3>
              
              {nextReleaseDate && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Próxima Edição Programada</span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">
                    {nextReleaseDate.toLocaleString('pt-BR', { 
                      timeZone: 'America/Sao_Paulo',
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={releaseSettings.isRecurring}
                    onCheckedChange={(checked) => 
                      setReleaseSettings(prev => ({ ...prev, isRecurring: checked }))
                    }
                  />
                  <Label htmlFor="recurring">Edições Recorrentes</Label>
                </div>
                
                {!releaseSettings.isRecurring ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Data e Hora Específica</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="custom-date">Data</Label>
                        <Input
                          id="custom-date"
                          type="date"
                          value={releaseSettings.customDate}
                          onChange={(e) => 
                            setReleaseSettings(prev => ({ ...prev, customDate: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-time">Horário (São Paulo)</Label>
                        <Input
                          id="custom-time"
                          type="time"
                          value={releaseSettings.customTime}
                          onChange={(e) => 
                            setReleaseSettings(prev => ({ ...prev, customTime: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium">Configuração Recorrente</h4>
                    
                    <div>
                      <Label htmlFor="pattern">Padrão</Label>
                      <Select
                        value={releaseSettings.recurringPattern}
                        onValueChange={(value: 'weekly' | 'biweekly') => 
                          setReleaseSettings(prev => ({ ...prev, recurringPattern: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quinzenal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Dias da Semana</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'].map((day) => (
                          <Button
                            key={day}
                            variant={releaseSettings.recurringDays.includes(day) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRecurringDayToggle(day)}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="recurring-time">Horário (São Paulo)</Label>
                      <Input
                        id="recurring-time"
                        type="time"
                        value={releaseSettings.recurringTime}
                        onChange={(e) => 
                          setReleaseSettings(prev => ({ ...prev, recurringTime: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="wipe-suggestions"
                    checked={releaseSettings.wipeSuggestions}
                    onCheckedChange={(checked) => 
                      setReleaseSettings(prev => ({ ...prev, wipeSuggestions: checked }))
                    }
                  />
                  <Label htmlFor="wipe-suggestions">Limpar sugestões a cada nova edição</Label>
                </div>
                
                <Button onClick={handleSaveReleaseSettings} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações Avançadas</h3>
            <p className="text-muted-foreground">
              Configurações avançadas para personalização da homepage em desenvolvimento...
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
