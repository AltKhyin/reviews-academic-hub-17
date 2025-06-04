import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
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

const configSchema = z.object({
  tagline: z.string().min(1, 'Tagline é obrigatória'),
  nextReviewTs: z.string().min(1, 'Data da próxima review é obrigatória'),
  bookmarks: z.array(bookmarkSchema),
  rules: z.array(z.string().min(1)),
  changelog: z.object({
    show: z.boolean(),
    entries: z.array(changelogEntrySchema),
  }),
});

type ConfigFormData = z.infer<typeof configSchema>;

export const SidebarConfigPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    },
  });

  const { watch, setValue, getValues } = form;
  const bookmarks = watch('bookmarks');
  const rules = watch('rules');
  const changelogEntries = watch('changelog.entries');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'sidebar_config')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const config = data.value as unknown as SidebarConfig;
        
        // Validate the loaded config
        if (config && typeof config === 'object') {
          form.reset({
            tagline: config.tagline || '',
            nextReviewTs: config.nextReviewTs || '',
            bookmarks: config.bookmarks?.map(bookmark => ({
              label: bookmark.label || '',
              url: bookmark.url || '',
              icon: (bookmark.icon === 'external' ? 'external' : 'link') as 'link' | 'external'
            })) || [],
            rules: Array.isArray(config.rules) ? config.rules.filter(rule => rule && rule.trim()) : [],
            changelog: {
              show: Boolean(config.changelog?.show ?? true),
              entries: Array.isArray(config.changelog?.entries) ? 
                config.changelog.entries.filter(entry => entry && entry.date && entry.text) : []
            },
          });
        }
      } else {
        // Set default values if no config exists
        form.reset({
          tagline: 'Quem aprende junto, cresce.',
          nextReviewTs: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          bookmarks: [],
          rules: [],
          changelog: { show: true, entries: [] },
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
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
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'sidebar_config',
          value: data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Configuração salva',
        description: 'A configuração da barra lateral foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Não foi possível salvar a configuração.');
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a configuração.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
