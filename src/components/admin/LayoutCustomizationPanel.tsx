
// ABOUTME: Admin panel for customizing homepage layout spacing and sizing
// Provides granular control over padding, margin, and sizing for each section

import React, { useState } from 'react';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { SpacingConfig, SizeConfig, SectionLayoutConfig, TailwindSpacing, TailwindMaxWidth, TailwindWidth } from '@/types/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, Eye, EyeOff, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TAILWIND_SPACING_OPTIONS: TailwindSpacing[] = [
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '40', '44', '48', '52',
  '56', '60', '64', '72', '80', '96'
];

const TAILWIND_MAX_WIDTH_OPTIONS: TailwindMaxWidth[] = [
  'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl',
  'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full', 'max-w-screen-sm',
  'max-w-screen-md', 'max-w-screen-lg', 'max-w-screen-xl', 'max-w-screen-2xl'
];

const TAILWIND_WIDTH_OPTIONS: TailwindWidth[] = [
  'w-auto', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit',
  'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5'
];

interface SpacingControlsProps {
  label: string;
  spacing: SpacingConfig;
  onChange: (spacing: SpacingConfig) => void;
}

const SpacingControls: React.FC<SpacingControlsProps> = ({ label, spacing, onChange }) => {
  const updateSpacing = (side: keyof SpacingConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({ ...spacing, [side]: numValue });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Top</Label>
          <Select value={spacing.top.toString()} onValueChange={(v) => updateSpacing('top', v)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAILWIND_SPACING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Right</Label>
          <Select value={spacing.right.toString()} onValueChange={(v) => updateSpacing('right', v)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAILWIND_SPACING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Bottom</Label>
          <Select value={spacing.bottom.toString()} onValueChange={(v) => updateSpacing('bottom', v)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAILWIND_SPACING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Left</Label>
          <Select value={spacing.left.toString()} onValueChange={(v) => updateSpacing('left', v)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAILWIND_SPACING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

interface SizeControlsProps {
  size: SizeConfig;
  onChange: (size: SizeConfig) => void;
}

const SizeControls: React.FC<SizeControlsProps> = ({ size, onChange }) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Size Configuration</Label>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Max Width</Label>
          <Select value={size.maxWidth} onValueChange={(v) => onChange({ ...size, maxWidth: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAILWIND_MAX_WIDTH_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Width</Label>
          <Select value={size.width} onValueChange={(v) => onChange({ ...size, width: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAILWIND_WIDTH_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

interface SectionConfigCardProps {
  section: SectionLayoutConfig;
  onUpdate: (updates: Partial<SectionLayoutConfig>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const SectionConfigCard: React.FC<SectionConfigCardProps> = ({
  section,
  onUpdate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}) => {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{section.name}</CardTitle>
            <Badge variant={section.visible ? "default" : "outline"} className="text-xs">
              {section.visible ? "Visible" : "Hidden"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdate({ visible: !section.visible })}
            >
              {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveUp}
              disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveDown}
              disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="padding" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="padding">Padding</TabsTrigger>
            <TabsTrigger value="margin">Margin</TabsTrigger>
            <TabsTrigger value="size">Size</TabsTrigger>
          </TabsList>
          <TabsContent value="padding" className="mt-4">
            <SpacingControls
              label="Padding"
              spacing={section.padding}
              onChange={(padding) => onUpdate({ padding })}
            />
          </TabsContent>
          <TabsContent value="margin" className="mt-4">
            <SpacingControls
              label="Margin"
              spacing={section.margin}
              onChange={(margin) => onUpdate({ margin })}
            />
          </TabsContent>
          <TabsContent value="size" className="mt-4">
            <SizeControls
              size={section.size}
              onChange={(size) => onUpdate({ size })}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export const LayoutCustomizationPanel: React.FC = () => {
  const {
    config,
    isLoading,
    hasUnsavedChanges,
    updateConfig,
    updateSection,
    reorderSections,
    saveConfig,
    resetToDefault,
    getOrderedVisibleSections
  } = useLayoutConfig();

  const [activeTab, setActiveTab] = useState<'global' | 'sections'>('sections');

  const handleSectionUpdate = (sectionId: string, updates: Partial<SectionLayoutConfig>) => {
    updateSection(sectionId, updates);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = config.sections.sort((a, b) => a.order - b.order);
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newOrder = sections.map(s => s.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
    
    reorderSections(newOrder);
  };

  const handleSave = async () => {
    try {
      saveConfig();
      toast({
        title: "Layout saved",
        description: "Homepage layout configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving layout",
        description: "Failed to save layout configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetToDefault();
    toast({
      title: "Layout reset",
      description: "Homepage layout has been reset to default configuration.",
    });
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const orderedSections = config.sections.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homepage Layout Customization</h2>
          <p className="text-muted-foreground">
            Customize spacing, sizing, and layout for the homepage sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'global' | 'sections')}>
        <TabsList>
          <TabsTrigger value="sections">Section Layout</TabsTrigger>
          <TabsTrigger value="global">Global Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <div className="space-y-4">
            {orderedSections.map((section, index) => (
              <SectionConfigCard
                key={section.id}
                section={section}
                onUpdate={(updates) => handleSectionUpdate(section.id, updates)}
                onMoveUp={() => handleMoveSection(section.id, 'up')}
                onMoveDown={() => handleMoveSection(section.id, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < orderedSections.length - 1}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Global Page Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="padding" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="padding">Global Padding</TabsTrigger>
                  <TabsTrigger value="margin">Global Margin</TabsTrigger>
                  <TabsTrigger value="size">Global Size</TabsTrigger>
                </TabsList>
                <TabsContent value="padding" className="mt-4">
                  <SpacingControls
                    label="Global Padding"
                    spacing={config.globalPadding}
                    onChange={(globalPadding) => updateConfig({ globalPadding })}
                  />
                </TabsContent>
                <TabsContent value="margin" className="mt-4">
                  <SpacingControls
                    label="Global Margin"
                    spacing={config.globalMargin}
                    onChange={(globalMargin) => updateConfig({ globalMargin })}
                  />
                </TabsContent>
                <TabsContent value="size" className="mt-4">
                  <SizeControls
                    size={config.globalSize}
                    onChange={(globalSize) => updateConfig({ globalSize })}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
