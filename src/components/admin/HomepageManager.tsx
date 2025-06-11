
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface SectionConfig {
  visible: boolean;
  order: number;
  days_for_new_badge?: number;
  max_items?: number;
  period?: string;
}

interface HomeSettings {
  sections: {
    reviewer_notes: SectionConfig;
    featured_carousel: SectionConfig;
    recent_issues: SectionConfig;
    popular_issues: SectionConfig;
    recommended_issues: SectionConfig;
    upcoming_releases: SectionConfig;
  };
  recent_issues?: {
    days_for_new_badge: number;
    max_items: number;
  };
  popular_issues?: {
    period: string;
    max_items: number;
  };
  recommended_issues?: {
    max_items: number;
  };
}

const defaultSettings: HomeSettings = {
  sections: {
    reviewer_notes: { visible: true, order: 0 },
    featured_carousel: { visible: true, order: 1 },
    recent_issues: { visible: true, order: 2, days_for_new_badge: 7, max_items: 10 },
    popular_issues: { visible: true, order: 3, period: "week", max_items: 10 },
    recommended_issues: { visible: true, order: 4, max_items: 10 },
    upcoming_releases: { visible: true, order: 5 }
  },
  recent_issues: {
    days_for_new_badge: 7,
    max_items: 10
  },
  popular_issues: {
    period: "week",
    max_items: 10
  },
  recommended_issues: {
    max_items: 10
  }
};

export const HomepageManager: React.FC = () => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'home_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.value) {
        setSettings(data.value as HomeSettings);
      }
    } catch (error: any) {
      console.error('Error loading homepage settings:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message || "Não foi possível carregar as configurações da página inicial.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: settings
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações da página inicial foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving homepage settings:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast({
      title: "Configurações resetadas",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  const updateSectionConfig = (sectionKey: keyof HomeSettings['sections'], config: Partial<SectionConfig>) => {
    setSettings(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          ...prev.sections[sectionKey],
          ...config
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Create array with unique keys for sections
  const sectionEntries = Object.entries(settings.sections).map(([key, config], index) => ({
    key: `section-${key}`,
    sectionKey: key as keyof HomeSettings['sections'],
    config,
    displayName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Página Inicial</h2>
          <p className="text-muted-foreground mt-1">
            Configure a visibilidade e ordem das seções da página inicial
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração das Seções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sectionEntries.map(({ key, sectionKey, config, displayName }) => (
              <div key={key} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{displayName}</h3>
                  <Switch
                    checked={config.visible}
                    onCheckedChange={(visible) => updateSectionConfig(sectionKey, { visible })}
                  />
                </div>
                
                {config.visible && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${key}-order`}>Ordem</Label>
                      <Input
                        id={`${key}-order`}
                        type="number"
                        value={config.order}
                        onChange={(e) => updateSectionConfig(sectionKey, { order: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>

                    {sectionKey === 'recent_issues' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${key}-badge-days`}>Dias para badge "Novo"</Label>
                          <Input
                            id={`${key}-badge-days`}
                            type="number"
                            value={config.days_for_new_badge || 7}
                            onChange={(e) => updateSectionConfig(sectionKey, { days_for_new_badge: parseInt(e.target.value) || 7 })}
                            min="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${key}-max-items`}>Máximo de itens</Label>
                          <Input
                            id={`${key}-max-items`}
                            type="number"
                            value={config.max_items || 10}
                            onChange={(e) => updateSectionConfig(sectionKey, { max_items: parseInt(e.target.value) || 10 })}
                            min="1"
                          />
                        </div>
                      </>
                    )}

                    {sectionKey === 'popular_issues' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${key}-period`}>Período</Label>
                          <Select
                            value={config.period || 'week'}
                            onValueChange={(period) => updateSectionConfig(sectionKey, { period })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Dia</SelectItem>
                              <SelectItem value="week">Semana</SelectItem>
                              <SelectItem value="month">Mês</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${key}-max-items-popular`}>Máximo de itens</Label>
                          <Input
                            id={`${key}-max-items-popular`}
                            type="number"
                            value={config.max_items || 10}
                            onChange={(e) => updateSectionConfig(sectionKey, { max_items: parseInt(e.target.value) || 10 })}
                            min="1"
                          />
                        </div>
                      </>
                    )}

                    {sectionKey === 'recommended_issues' && (
                      <div className="space-y-2">
                        <Label htmlFor={`${key}-max-items-recommended`}>Máximo de itens</Label>
                        <Input
                          id={`${key}-max-items-recommended`}
                          type="number"
                          value={config.max_items || 10}
                          onChange={(e) => updateSectionConfig(sectionKey, { max_items: parseInt(e.target.value) || 10 })}
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
