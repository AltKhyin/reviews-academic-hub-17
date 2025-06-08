
// ABOUTME: Home page management interface for admins
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, Home, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useHomeData } from '@/hooks/useHomeData';
import { useReviewerNotes } from '@/hooks/useReviewerNotes';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeSettings } from '@/types/home';

export const HomeManager = () => {
  const { 
    homeSettings, 
    isLoading, 
    updateHomeSettings, 
    isUpdating 
  } = useHomeData();
  
  const {
    notes,
    isLoading: notesLoading,
    createNote,
    updateNote,
    deleteNote
  } = useReviewerNotes();
  
  const { profile } = useAuth();
  
  const [localSettings, setLocalSettings] = useState<HomeSettings | null>(null);
  const [noteForm, setNoteForm] = useState({
    message: '',
    display_name: '',
    avatar_url: ''
  });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  // Initialize local settings
  useEffect(() => {
    if (homeSettings) {
      setLocalSettings({ ...homeSettings });
    }
  }, [homeSettings]);

  // Reset note form
  const resetNoteForm = () => {
    setNoteForm({
      message: '',
      display_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || ''
    });
    setEditingNote(null);
  };

  const handleSectionToggle = (sectionId: string) => {
    if (!localSettings) return;
    
    const updatedSettings = {
      ...localSettings,
      sections: {
        ...localSettings.sections,
        [sectionId]: {
          ...localSettings.sections[sectionId as keyof typeof localSettings.sections],
          visible: !localSettings.sections[sectionId as keyof typeof localSettings.sections].visible
        }
      }
    };
    
    setLocalSettings(updatedSettings);
  };

  const handleSectionReorder = (sectionId: string, direction: 'up' | 'down') => {
    if (!localSettings) return;

    const sections = Object.entries(localSettings.sections);
    const currentIndex = sections.findIndex(([id]) => id === sectionId);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sections.length - 1) ||
      currentIndex === -1
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap orders
    const newSections = { ...localSettings.sections };
    const currentOrder = newSections[sectionId as keyof typeof newSections].order;
    const targetSectionId = sections[targetIndex][0];
    const targetOrder = newSections[targetSectionId as keyof typeof newSections].order;
    
    newSections[sectionId as keyof typeof newSections] = {
      ...newSections[sectionId as keyof typeof newSections],
      order: targetOrder
    };
    newSections[targetSectionId as keyof typeof newSections] = {
      ...newSections[targetSectionId as keyof typeof newSections],
      order: currentOrder
    };

    setLocalSettings({
      ...localSettings,
      sections: newSections
    });
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    
    try {
      await updateHomeSettings(localSettings);
      toast({
        title: "Configurações salvas",
        description: "As configurações da página inicial foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNote = async () => {
    if (!noteForm.message || !noteForm.display_name || !profile?.id) return;
    
    try {
      await createNote({
        admin_id: profile.id,
        message: noteForm.message,
        display_name: noteForm.display_name,
        avatar_url: noteForm.avatar_url,
        is_verified: true,
        is_active: true
      });
      
      resetNoteForm();
      setIsNoteDialogOpen(false);
      
      toast({
        title: "Nota criada",
        description: "A nota do revisor foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar a nota.",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes?.find(n => n.id === noteId);
    if (note) {
      setNoteForm({
        message: note.message,
        display_name: note.display_name,
        avatar_url: note.avatar_url || ''
      });
      setEditingNote(noteId);
      setIsNoteDialogOpen(true);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !noteForm.message || !noteForm.display_name) return;
    
    try {
      await updateNote({
        id: editingNote,
        message: noteForm.message,
        display_name: noteForm.display_name,
        avatar_url: noteForm.avatar_url
      });
      
      resetNoteForm();
      setIsNoteDialogOpen(false);
      
      toast({
        title: "Nota atualizada",
        description: "A nota do revisor foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a nota.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast({
        title: "Nota removida",
        description: "A nota do revisor foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover a nota.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !localSettings) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sectionLabels = {
    reviewer_notes: 'Notas dos Revisores',
    featured_carousel: 'Carrossel em Destaque',
    recent_issues: 'Edições Recentes',
    popular_issues: 'Edições Populares',
    recommended_issues: 'Recomendadas',
    upcoming_releases: 'Próximas Edições'
  };

  const orderedSections = Object.entries(localSettings.sections)
    .sort(([_, a], [__, b]) => a.order - b.order);

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Home Manager
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure seções, notas dos revisores e outros aspectos da página inicial
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections">Gerenciar Seções</TabsTrigger>
            <TabsTrigger value="notes">Notas dos Revisores</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Seções da Página Inicial</h3>
            </div>
            
            <div className="space-y-4">
              {orderedSections.map(([sectionId, config], index) => (
                <div 
                  key={sectionId}
                  className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {sectionLabels[sectionId as keyof typeof sectionLabels]}
                    </span>
                    <Badge variant={config.visible ? "default" : "outline"}>
                      {config.visible ? "Visível" : "Oculta"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Ordem: {config.order}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.visible}
                      onCheckedChange={() => handleSectionToggle(sectionId)}
                    />
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSectionReorder(sectionId, 'up')}
                      disabled={index === 0}
                      title="Mover para cima"
                      className="h-8 w-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSectionReorder(sectionId, 'down')}
                      disabled={index === orderedSections.length - 1}
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
          
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notas dos Revisores</h3>
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetNoteForm} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Nota
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingNote ? 'Editar Nota' : 'Nova Nota do Revisor'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="display_name">Nome de Exibição</Label>
                      <Input
                        id="display_name"
                        value={noteForm.display_name}
                        onChange={(e) => setNoteForm(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Nome do revisor"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="avatar_url">URL do Avatar (opcional)</Label>
                      <Input
                        id="avatar_url"
                        value={noteForm.avatar_url}
                        onChange={(e) => setNoteForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea
                        id="message"
                        value={noteForm.message}
                        onChange={(e) => setNoteForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Digite a mensagem do revisor..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={editingNote ? handleUpdateNote : handleCreateNote}
                        className="flex-1"
                      >
                        {editingNote ? 'Atualizar' : 'Criar'} Nota
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsNoteDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              {notesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mx-auto"></div>
                </div>
              ) : notes && notes.length > 0 ? (
                notes.map((note) => (
                  <Card key={note.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{note.display_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {note.is_verified ? 'Verificado' : 'Não verificado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {note.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(note.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditNote(note.id)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma nota dos revisores configurada</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <h3 className="text-lg font-semibold">Configurações das Seções</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edições Recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Dias para badge "Novo"</Label>
                    <Input
                      type="number"
                      value={localSettings.recent_issues.days_for_new_badge}
                      onChange={(e) => setLocalSettings(prev => prev ? {
                        ...prev,
                        recent_issues: {
                          ...prev.recent_issues,
                          days_for_new_badge: parseInt(e.target.value) || 7
                        }
                      } : prev)}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <Label>Máximo de itens</Label>
                    <Input
                      type="number"
                      value={localSettings.recent_issues.max_items}
                      onChange={(e) => setLocalSettings(prev => prev ? {
                        ...prev,
                        recent_issues: {
                          ...prev.recent_issues,
                          max_items: parseInt(e.target.value) || 10
                        }
                      } : prev)}
                      min="1"
                      max="20"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edições Populares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Período</Label>
                    <Select
                      value={localSettings.popular_issues.period}
                      onValueChange={(value) => setLocalSettings(prev => prev ? {
                        ...prev,
                        popular_issues: {
                          ...prev.popular_issues,
                          period: value
                        }
                      } : prev)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Máximo de itens</Label>
                    <Input
                      type="number"
                      value={localSettings.popular_issues.max_items}
                      onChange={(e) => setLocalSettings(prev => prev ? {
                        ...prev,
                        popular_issues: {
                          ...prev.popular_issues,
                          max_items: parseInt(e.target.value) || 10
                        }
                      } : prev)}
                      min="1"
                      max="20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
