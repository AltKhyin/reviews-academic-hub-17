// ABOUTME: Enhanced sidebar configuration panel with comprehensive customization options
// Includes all sidebar sections and advanced settings

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSidebarData } from '@/hooks/useSidebarData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Settings2 } from 'lucide-react';

// Import all configuration components
import { CommunityHeaderConfig } from './sidebar/CommunityHeaderConfig';
import { ActiveUsersConfig } from './sidebar/ActiveUsersConfig';
import { CommentCarouselConfig } from './sidebar/CommentCarouselConfig';
import { TopThreadsConfig } from './sidebar/TopThreadsConfig';
import { ReviewCountdownConfig } from './sidebar/ReviewCountdownConfig';
import { PollConfig } from './sidebar/PollConfig';
import { SidebarStyleConfig } from './sidebar/SidebarStyleConfig';
import { AdvancedSidebarConfig } from './sidebar/AdvancedSidebarConfig';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { SidebarSection, SidebarConfig } from '@/types/sidebar';

export const SidebarConfigPanel: React.FC = () => {
  const { config, updateConfig, saveConfig, resetConfig } = useSidebarData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sections');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Safety check for config
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const handleConfigChange = (updates: Partial<SidebarConfig>) => {
    updateConfig(updates);
    setHasUnsavedChanges(true);
  };

  const handleSectionConfigChange = (config: any) => {
    // Handle individual section configuration changes
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveConfig();
      setHasUnsavedChanges(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações da barra lateral foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetConfig();
    setHasUnsavedChanges(false);
    toast({
      title: "Configurações resetadas",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  const handleSectionToggle = (sectionId: string) => {
    const updatedSections = config.sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    handleConfigChange({ sections: updatedSections });
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

    handleConfigChange({ sections: updatedSections });
  };

  const addBookmark = () => {
    const newBookmark = {
      label: 'Novo Bookmark',
      url: 'https://example.com',
      icon: 'link'
    };
    handleConfigChange({
      bookmarks: [...config.bookmarks, newBookmark]
    });
  };

  const removeBookmark = (index: number) => {
    const updatedBookmarks = config.bookmarks.filter((_, i) => i !== index);
    handleConfigChange({ bookmarks: updatedBookmarks });
  };

  const updateBookmark = (index: number, field: string, value: string) => {
    const updatedBookmarks = config.bookmarks.map((bookmark, i) =>
      i === index ? { ...bookmark, [field]: value } : bookmark
    );
    handleConfigChange({ bookmarks: updatedBookmarks });
  };

  const addRule = () => {
    handleConfigChange({
      rules: [...config.rules, 'Nova regra da comunidade']
    });
  };

  const removeRule = (index: number) => {
    const updatedRules = config.rules.filter((_, i) => i !== index);
    handleConfigChange({ rules: updatedRules });
  };

  const updateRule = (index: number, value: string) => {
    const updatedRules = config.rules.map((rule, i) =>
      i === index ? value : rule
    );
    handleConfigChange({ rules: updatedRules });
  };

  const addChangelogEntry = () => {
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      text: 'Nova entrada do changelog'
    };
    handleConfigChange({
      changelog: {
        ...config.changelog,
        entries: [...config.changelog.entries, newEntry]
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-6 h-6" />
            Configuração da Barra Lateral
          </h2>
          <p className="text-muted-foreground">
            Personalize todos os aspectos da barra lateral da comunidade
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              Alterações não salvas
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="sections">Seções</TabsTrigger>
          <TabsTrigger value="header">Cabeçalho</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="polls">Enquetes</TabsTrigger>
          <TabsTrigger value="style">Visual</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
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
                  onChange={(e) => handleConfigChange({ tagline: e.target.value })}
                  placeholder="Digite o tagline da comunidade..."
                />
              </div>
              <div>
                <Label htmlFor="next-review">Próxima Review (ISO String)</Label>
                <Input
                  id="next-review"
                  value={config.nextReviewTs}
                  onChange={(e) => handleConfigChange({ nextReviewTs: e.target.value })}
                  placeholder="2024-01-15T10:00:00Z"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookmarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.bookmarks.map((bookmark, index) => (
                <div key={index} className="space-y-2 border rounded-md p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor={`bookmark-label-${index}`}>Label</Label>
                      <Input
                        id={`bookmark-label-${index}`}
                        value={bookmark.label}
                        onChange={(e) => updateBookmark(index, 'label', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`bookmark-url-${index}`}>URL</Label>
                      <Input
                        id={`bookmark-url-${index}`}
                        value={bookmark.url}
                        onChange={(e) => updateBookmark(index, 'url', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`bookmark-icon-${index}`}>Icon</Label>
                      <Input
                        id={`bookmark-icon-${index}`}
                        value={bookmark.icon}
                        onChange={(e) => updateBookmark(index, 'icon', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBookmark(index)}
                    className="mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addBookmark} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bookmark
              </Button>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Changelog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Switch
                id="show-changelog"
                checked={config.changelog.show}
                onCheckedChange={(checked) =>
                  handleConfigChange({
                    changelog: { ...config.changelog, show: checked },
                  })
                }
              />
              <Label htmlFor="show-changelog">Mostrar Changelog</Label>

              {config.changelog.entries.map((entry, index) => (
                <div key={index} className="space-y-2 border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`changelog-date-${index}`}>Data</Label>
                      <Input
                        id={`changelog-date-${index}`}
                        type="date"
                        value={entry.date}
                        onChange={(e) => {
                          const updatedEntries = config.changelog.entries.map(
                            (item, i) =>
                              i === index ? { ...item, date: e.target.value } : item
                          );
                          handleConfigChange({
                            changelog: { ...config.changelog, entries: updatedEntries },
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`changelog-text-${index}`}>Texto</Label>
                      <Input
                        id={`changelog-text-${index}`}
                        value={entry.text}
                        onChange={(e) => {
                          const updatedEntries = config.changelog.entries.map(
                            (item, i) =>
                              i === index ? { ...item, text: e.target.value } : item
                          );
                          handleConfigChange({
                            changelog: { ...config.changelog, entries: updatedEntries },
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addChangelogEntry} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Entrada
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header">
          <CommunityHeaderConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>

        <TabsContent value="users">
          <ActiveUsersConfig 
            onConfigChange={handleSectionConfigChange}
          />
        </TabsContent>

        <TabsContent value="comments">
          <CommentCarouselConfig 
            onConfigChange={handleSectionConfigChange}
          />
        </TabsContent>

        <TabsContent value="threads">
          <TopThreadsConfig 
            onConfigChange={handleSectionConfigChange}
          />
        </TabsContent>

        <TabsContent value="polls">
          <div className="space-y-4">
            <PollConfig 
              onConfigChange={handleSectionConfigChange}
            />
            <ReviewCountdownConfig 
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="style">
          <SidebarStyleConfig 
            onConfigChange={handleSectionConfigChange}
          />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedSidebarConfig 
            onConfigChange={handleSectionConfigChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
