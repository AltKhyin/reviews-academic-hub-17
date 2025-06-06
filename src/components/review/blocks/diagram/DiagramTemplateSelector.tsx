
// ABOUTME: Template selector modal for scientific diagram patterns
// Provides pre-built templates for common scientific diagram types

import React from 'react';
import { DiagramNode, DiagramConnection } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  GitBranch, 
  Settings, 
  Users, 
  TrendingUp,
  Network,
  Stethoscope,
  FlaskConical,
  Target,
  BarChart3
} from 'lucide-react';
import { diagramTemplates } from './templates';

interface DiagramTemplateSelectorProps {
  onTemplateSelect: (nodes: DiagramNode[], connections: DiagramConnection[]) => void;
  onClose: () => void;
}

export const DiagramTemplateSelector: React.FC<DiagramTemplateSelectorProps> = ({
  onTemplateSelect,
  onClose
}) => {
  const categoryIcons = {
    'clinical': Stethoscope,
    'study-design': FileText,
    'decision-tree': GitBranch,
    'process-flow': Settings,
    'organizational': Users,
    'timeline': TrendingUp,
    'conceptual': Network,
    'evidence': Target,
    'research-structure': FlaskConical,
    'implementation': BarChart3,
    'custom': Settings
  };

  const categoryColors = {
    'clinical': '#dc2626',
    'study-design': '#3b82f6',
    'decision-tree': '#f59e0b',
    'process-flow': '#10b981',
    'organizational': '#8b5cf6',
    'timeline': '#06b6d4',
    'conceptual': '#ef4444',
    'evidence': '#059669',
    'research-structure': '#7c3aed',
    'implementation': '#0891b2',
    'custom': '#6b7280'
  };

  const handleTemplateSelect = (template: any) => {
    onTemplateSelect(template.nodes, template.connections);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh]"
        style={{ 
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#ffffff' }}>
            Modelos de Diagrama
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagramTemplates.map((template) => {
              const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || Settings;
              const categoryColor = categoryColors[template.category as keyof typeof categoryColors] || '#6b7280';
              
              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer transition-all hover:scale-105 border-2"
                  style={{ 
                    backgroundColor: '#212121',
                    borderColor: '#2a2a2a'
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{ color: categoryColor }}
                        />
                        <CardTitle 
                          className="text-lg"
                          style={{ color: '#ffffff' }}
                        >
                          {template.name}
                        </CardTitle>
                      </div>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: categoryColor,
                          color: categoryColor
                        }}
                      >
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription style={{ color: '#d1d5db' }}>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm" style={{ color: '#d1d5db' }}>
                        <strong>Elementos inclusos:</strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.nodes.length} nós
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.connections.length} conexões
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        style={{ 
                          borderColor: categoryColor,
                          color: categoryColor
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Usar este modelo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          <Button 
            variant="outline" 
            onClick={onClose}
            style={{ color: '#d1d5db' }}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
