
// ABOUTME: Enhanced sidebar configuration panel with comprehensive customization options
// Now fully integrated with the rendering system and proper type safety

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
import { SectionOrderConfig } from './sidebar/SectionOrderConfig';
import { GeneralInfoConfig } from './sidebar/GeneralInfoConfig';
import { BookmarksConfig } from './sidebar/BookmarksConfig';
import { RulesConfig } from './sidebar/RulesConfig';
import { ChangelogConfig } from './sidebar/ChangelogConfig';

export const SidebarConfigPanel: React.FC = () => {
  const { config, updateConfig, updateSectionConfig, saveConfig, resetConfig } = useSidebarData();
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

  const handleConfigChange = (updates: any) => {
    updateConfig(updates);
    setHasUnsavedChanges(true);
  };

  const handleSectionConfigChange = (sectionId: string, sectionConfig: any) => {
    updateSectionConfig(sectionId as any, sectionConfig);
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
          <SectionOrderConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
          <GeneralInfoConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
          <BookmarksConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
          <RulesConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
          <ChangelogConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>

        <TabsContent value="header">
          <CommunityHeaderConfig 
            config={config.sections.find(s => s.id === 'header')?.config || {}}
            onConfigChange={(sectionConfig) => handleSectionConfigChange('header', sectionConfig)}
          />
        </TabsContent>

        <TabsContent value="users">
          <ActiveUsersConfig 
            config={config.sections.find(s => s.id === 'users')?.config || {}}
            onConfigChange={(sectionConfig) => handleSectionConfigChange('users', sectionConfig)}
          />
        </TabsContent>

        <TabsContent value="comments">
          <CommentCarouselConfig 
            config={config.sections.find(s => s.id === 'comments')?.config || {}}
            onConfigChange={(sectionConfig) => handleSectionConfigChange('comments', sectionConfig)}
          />
        </TabsContent>

        <TabsContent value="threads">
          <TopThreadsConfig 
            config={config.sections.find(s => s.id === 'threads')?.config || {}}
            onConfigChange={(sectionConfig) => handleSectionConfigChange('threads', sectionConfig)}
          />
        </TabsContent>

        <TabsContent value="polls">
          <div className="space-y-4">
            <PollConfig 
              config={config.sections.find(s => s.id === 'poll')?.config || {}}
              onConfigChange={(sectionConfig) => handleSectionConfigChange('poll', sectionConfig)}
            />
            <ReviewCountdownConfig 
              config={config.sections.find(s => s.id === 'countdown')?.config || {}}
              globalConfig={config}
              onConfigChange={(sectionConfig) => handleSectionConfigChange('countdown', sectionConfig)}
              onGlobalConfigChange={handleConfigChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="style">
          <SidebarStyleConfig 
            config={config.visual || {}}
            onConfigChange={(visualConfig) => handleConfigChange({ visual: { ...config.visual, ...visualConfig } })}
          />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedSidebarConfig 
            config={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
