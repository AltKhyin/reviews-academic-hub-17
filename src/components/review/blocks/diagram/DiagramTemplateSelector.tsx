
// ABOUTME: Template selector modal for scientific diagram patterns
// Provides pre-built templates for common scientific diagram types

import React from 'react';
import { DiagramNode, DiagramConnection, DiagramTemplate } from '@/types/review';
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
  Network
} from 'lucide-react';

interface DiagramTemplateSelectorProps {
  onTemplateSelect: (nodes: DiagramNode[], connections: DiagramConnection[]) => void;
  onClose: () => void;
}

export const DiagramTemplateSelector: React.FC<DiagramTemplateSelectorProps> = ({
  onTemplateSelect,
  onClose
}) => {
  const templates: DiagramTemplate[] = [
    {
      id: 'study-flow',
      name: 'Fluxo de Estudo',
      description: 'Fluxograma padrão para apresentar o fluxo de participantes em estudos clínicos',
      category: 'study-design',
      preview: '',
      defaultSize: { width: 800, height: 600 },
      nodes: [
        {
          id: 'assessed',
          type: 'rectangle',
          position: { x: 350, y: 50 },
          size: { width: 200, height: 60 },
          text: 'Avaliados para elegibilidade\n(n = )',
          style: {
            backgroundColor: '#3b82f6',
            borderColor: '#1d4ed8',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'excluded',
          type: 'rectangle',
          position: { x: 600, y: 150 },
          size: { width: 180, height: 80 },
          text: 'Excluídos (n = )\n• Critério A (n = )\n• Critério B (n = )',
          style: {
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 12,
            fontWeight: 'normal',
            textAlign: 'left',
            opacity: 1
          }
        },
        {
          id: 'randomized',
          type: 'rectangle',
          position: { x: 350, y: 200 },
          size: { width: 200, height: 60 },
          text: 'Randomizados\n(n = )',
          style: {
            backgroundColor: '#10b981',
            borderColor: '#059669',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'group-a',
          type: 'rectangle',
          position: { x: 250, y: 320 },
          size: { width: 150, height: 80 },
          text: 'Grupo Intervenção\n(n = )',
          style: {
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'group-b',
          type: 'rectangle',
          position: { x: 450, y: 320 },
          size: { width: 150, height: 80 },
          text: 'Grupo Controle\n(n = )',
          style: {
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 1
          }
        }
      ],
      connections: [
        {
          id: 'conn1',
          sourceNodeId: 'assessed',
          targetNodeId: 'excluded',
          sourcePoint: 'right',
          targetPoint: 'top',
          style: {
            strokeColor: '#6b7280',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: true,
            opacity: 1
          }
        },
        {
          id: 'conn2',
          sourceNodeId: 'assessed',
          targetNodeId: 'randomized',
          sourcePoint: 'bottom',
          targetPoint: 'top',
          style: {
            strokeColor: '#6b7280',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: false,
            opacity: 1
          }
        },
        {
          id: 'conn3',
          sourceNodeId: 'randomized',
          targetNodeId: 'group-a',
          sourcePoint: 'bottom',
          targetPoint: 'top',
          style: {
            strokeColor: '#6b7280',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: true,
            opacity: 1
          }
        },
        {
          id: 'conn4',
          sourceNodeId: 'randomized',
          targetNodeId: 'group-b',
          sourcePoint: 'bottom',
          targetPoint: 'top',
          style: {
            strokeColor: '#6b7280',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: true,
            opacity: 1
          }
        }
      ]
    },
    {
      id: 'decision-tree',
      name: 'Árvore de Decisão',
      description: 'Estrutura para critérios de inclusão/exclusão ou algoritmos de tratamento',
      category: 'decision-tree',
      preview: '',
      defaultSize: { width: 800, height: 600 },
      nodes: [
        {
          id: 'start',
          type: 'circle',
          position: { x: 400, y: 50 },
          size: { width: 100, height: 100 },
          text: 'Início',
          style: {
            backgroundColor: '#10b981',
            borderColor: '#059669',
            textColor: '#ffffff',
            borderWidth: 3,
            borderStyle: 'solid',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'decision1',
          type: 'diamond',
          position: { x: 350, y: 200 },
          size: { width: 200, height: 100 },
          text: 'Critério A\natendido?',
          style: {
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'exclude1',
          type: 'rectangle',
          position: { x: 150, y: 350 },
          size: { width: 120, height: 60 },
          text: 'Excluir',
          style: {
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'decision2',
          type: 'diamond',
          position: { x: 550, y: 350 },
          size: { width: 200, height: 100 },
          text: 'Critério B\natendido?',
          style: {
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            opacity: 1
          }
        },
        {
          id: 'include',
          type: 'rectangle',
          position: { x: 600, y: 500 },
          size: { width: 120, height: 60 },
          text: 'Incluir',
          style: {
            backgroundColor: '#3b82f6',
            borderColor: '#1d4ed8',
            textColor: '#ffffff',
            borderWidth: 2,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'normal',
            textAlign: 'center',
            opacity: 1
          }
        }
      ],
      connections: [
        {
          id: 'conn1',
          sourceNodeId: 'start',
          targetNodeId: 'decision1',
          sourcePoint: 'bottom',
          targetPoint: 'top',
          style: {
            strokeColor: '#6b7280',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: false,
            opacity: 1
          }
        },
        {
          id: 'conn2',
          sourceNodeId: 'decision1',
          targetNodeId: 'exclude1',
          sourcePoint: 'left',
          targetPoint: 'top',
          style: {
            strokeColor: '#ef4444',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: true,
            opacity: 1
          },
          label: {
            text: 'Não',
            position: 0.5,
            style: {
              backgroundColor: '#ffffff',
              textColor: '#ef4444',
              fontSize: 12
            }
          }
        },
        {
          id: 'conn3',
          sourceNodeId: 'decision1',
          targetNodeId: 'decision2',
          sourcePoint: 'right',
          targetPoint: 'top',
          style: {
            strokeColor: '#10b981',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: true,
            opacity: 1
          },
          label: {
            text: 'Sim',
            position: 0.5,
            style: {
              backgroundColor: '#ffffff',
              textColor: '#10b981',
              fontSize: 12
            }
          }
        },
        {
          id: 'conn4',
          sourceNodeId: 'decision2',
          targetNodeId: 'include',
          sourcePoint: 'bottom',
          targetPoint: 'top',
          style: {
            strokeColor: '#10b981',
            strokeWidth: 2,
            strokeStyle: 'solid',
            arrowType: 'arrow',
            curved: false,
            opacity: 1
          },
          label: {
            text: 'Sim',
            position: 0.5,
            style: {
              backgroundColor: '#ffffff',
              textColor: '#10b981',
              fontSize: 12
            }
          }
        }
      ]
    }
  ];

  const categoryIcons = {
    'study-design': FileText,
    'decision-tree': GitBranch,
    'process-flow': Settings,
    'organizational': Users,
    'timeline': TrendingUp,
    'conceptual': Network,
    'custom': Settings
  };

  const categoryColors = {
    'study-design': '#3b82f6',
    'decision-tree': '#f59e0b',
    'process-flow': '#10b981',
    'organizational': '#8b5cf6',
    'timeline': '#ef4444',
    'conceptual': '#06b6d4',
    'custom': '#6b7280'
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#ffffff' }}>Modelos de Diagrama</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => {
              const Icon = categoryIcons[template.category];
              const color = categoryColors[template.category];
              
              return (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
                  onClick={() => onTemplateSelect(template.nodes, template.connections)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color }} />
                        <CardTitle className="text-lg" style={{ color: '#ffffff' }}>
                          {template.name}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" style={{ borderColor: color, color }}>
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardDescription style={{ color: '#d1d5db' }}>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Template Preview */}
                    <div 
                      className="w-full h-32 rounded border flex items-center justify-center text-sm"
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#9ca3af' }}
                    >
                      Preview: {template.nodes.length} elementos, {template.connections.length} conexões
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center text-sm" style={{ color: '#9ca3af' }}>
                      <span>{template.nodes.length} elementos</span>
                      <span>{template.connections.length} conexões</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
