import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, AlertTriangle, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SidebarConfig } from '@/types/sidebar';

const bookmarkSchema = z.object({
  label: z.string().min(1, 'Label é obrigatório'),
  url: z.string().url('URL deve ser válida'),
  icon: z.enum(['link', 'external']),
});

const changelogEntrySchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  text: z.string().min(1, 'Texto é obrigatório'),
});

const sectionConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  order: z.number(),
});

const configSchema = z.object({
  tagline: z.string().min(1, 'Tagline é obrigatória'),
  nextReviewTs: z.string().min(1, 'Data da próxima review é obrigatória'),
  bookmarks: z.array(bookmarkSchema),
  rules: z.array(z.string().min(1)),
  changelog: z.object({
    show: z.boolean(),
    entries: z.array(changelogEntrySchema),
  }),
  sections: z.array(sectionConfigSchema),
});

type ConfigFormData = z.infer<typeof configSchema>;

const DEFAULT_SECTIONS = [
  { id: 'community-header', name: 'Cabeçalho da Comunidade', enabled: true, order: 0 },
  { id: 'active-avatars', name: 'Avatares Ativos', enabled: true, order: 1 },
  { id: 'top-threads', name: 'Discussões em Alta', enabled: true, order: 2 },
  { id: 'next-review', name: 'Próxima Edição', enabled: true, order: 3 },
  { id: 'weekly-poll', name: 'Enquete da Semana', enabled: true, order: 4 },
  { id: 'resource-bookmarks', name: 'Links Úteis', enabled: true, order: 5 },
  { id: 'rules-accordion', name: 'Regras da Comunidade', enabled: true, order: 6 },
  { id: 'mini-changelog', name: 'Changelog', enabled: true, order: 7 },
];

export const SidebarConfigPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      tagline: '',
      nextReviewTs: '',
      bookmarks: [],
      rules: [],
      changelog: {
        show: true,
        entries: [],
      },
      sections: DEFAULT_SECTIONS,
    },
  });

  const { watch, setValue, getValues } = form;
  const bookmarks = watch('bookmarks');
  const rules = watch('rules');
  const changelogEntries = watch('changelog.entries');
  const sections = watch('sections');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading sidebar configuration...');
      
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'sidebar_config')
        .maybeSingle();

      if (error) {
        console.error('Database error loading config:', error);
        throw error;
      }

      if (data) {
        console.log('Found existing configuration:', data.value);
        const config = data.value as unknown as SidebarConfig;
        
        if (config && typeof config === 'object') {
          // Enhanced migration logic to handle missing properties
          const migratedConfig = {
            tagline: config.tagline || 'Quem aprende junto, cresce.',
            nextReviewTs: config.nextReviewTs || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            bookmarks: Array.isArray(config.bookmarks) ? config.bookmarks.map(bookmark => ({
              label: bookmark.label || '',
              url: bookmark.url || '',
              icon: (bookmark.icon === 'external' ? 'external' : 'link') as 'link' | 'external'
            })) : [],
            rules: Array.isArray(config.rules) ? config.rules.filter(rule => rule && rule.trim()) : [],
            changelog: {
              show: Boolean(config.changelog?.show ?? true),
              entries: Array.isArray(config.changelog?.entries) ? 
                config.changelog.entries.filter(entry => entry && entry.date && entry.text) : []
            },
            // Handle missing sections property with backward compatibility
            sections: Array.isArray((config as any).sections) ? (config as any).sections : DEFAULT_SECTIONS,
          };
          
          console.log('Migrated configuration:', migratedConfig);
          form.reset(migratedConfig);
        }
      } else {
        console.log('No existing configuration found, using defaults');
        form.reset({
          tagline: 'Quem aprende junto, cresce.',
          nextReviewTs: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          bookmarks: [],
          rules: [],
          changelog: { show: true, entries: [] },
          sections: DEFAULT_SECTIONS,
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      setError('Não foi possível carregar a configuração atual.');
      toast({
        title: 'Erro ao carregar configuração',
        description: 'Não foi possível carregar a configuração atual.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ConfigFormData) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('Saving sidebar configuration:', data);
      
      // Prepare data with proper structure and ensure sections have correct order
      const configData = {
        ...data,
        sections: data.sections.map((section, index) => ({
          ...section,
          order: index // Ensure order is sequential based on current array position
        }))
      };

      console.log('Prepared config data for save:', configData);

      // Enhanced upsert with explicit conflict resolution
      const { error } = await supabase
        .from('site_meta')
        .upsert(
          {
            key: 'sidebar_config',
            value: configData,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'key',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error('Database error saving config:', error);
        
        // Provide specific error messages based on error type
        if (error.message.includes('duplicate key')) {
          throw new Error('Conflito de configuração - tentando novamente...');
        } else if (error.message.includes('permission denied')) {
          throw new Error('Permissões insuficientes para salvar a configuração');
        } else {
          throw new Error(`Erro no banco de dados: ${error.message}`);
        }
      }

      console.log('Configuration saved successfully');
      
      toast({
        title: 'Configuração salva',
        description: 'A configuração da barra lateral foi atualizada com sucesso.',
      });
    } catch (error: any) {
      console.error('Error saving config:', error);
      const errorMessage = error.message || 'Não foi possível salvar a configuração.';
      setError(errorMessage);
      toast({
        title: 'Erro ao salvar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) return;
    
    const newSections = [...sections];
    const draggedSection = newSections[draggedItem];
    newSections.splice(draggedItem, 1);
    newSections.splice(dropIndex, 0, draggedSection);
    
    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setValue('sections', updatedSections);
    setDraggedItem(null);
  };

  const toggleSectionEnabled = (index: number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], enabled: !newSections[index].enabled };
    setValue('sections', newSections);
  };

  const addBookmark = () => {
    setValue('bookmarks', [...bookmarks, { label: '', url: '', icon: 'link' as const }]);
  };

  const removeBookmark = (index: number) => {
    setValue('bookmarks', bookmarks.filter((_, i) => i !== index));
  };

  const addRule = () => {
    setValue('rules', [...rules, '']);
  };

  const removeRule = (index: number) => {
    setValue('rules', rules.filter((_, i) => i !== index));
  };

  const addChangelogEntry = () => {
    setValue('changelog.entries', [...changelogEntries, { date: '', text: '' }]);
  };

  const removeChangelogEntry = (index: number) => {
    setValue('changelog.entries', changelogEntries.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-700 rounded w-64 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuração da Barra Lateral</h1>
        <Button 
          onClick={() => form.handleSubmit(onSubmit)()} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ordem e Visibilidade das Seções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 cursor-move hover:bg-gray-800/70 transition-colors"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-200">{section.name}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => toggleSectionEnabled(index)}
                      className="flex items-center space-x-1 text-sm"
                    >
                      {section.enabled ? (
                        <>
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Visível</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Oculta</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Quem aprende junto, cresce." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextReviewTs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Próxima Review</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Bookmarks
                <Button type="button" variant="outline" size="sm" onClick={addBookmark}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookmarks.map((_, index) => (
                <div key={index} className="flex items-end space-x-2">
                  <FormField
                    control={form.control}
                    name={`bookmarks.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: PubMed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`bookmarks.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBookmark(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Regras da Comunidade
                <Button type="button" variant="outline" size="sm" onClick={addRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`rules.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Digite uma regra..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRule(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Changelog
                <Button type="button" variant="outline" size="sm" onClick={addChangelogEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {changelogEntries.map((_, index) => (
                <div key={index} className="flex items-end space-x-2">
                  <FormField
                    control={form.control}
                    name={`changelog.entries.${index}.date`}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`changelog.entries.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Texto</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva a mudança..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeChangelogEntry(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
