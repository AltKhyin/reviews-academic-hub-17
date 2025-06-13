
// ABOUTME: Comprehensive toolbar for diagram creation with shape tools and styling options
// Provides access to node types, styling, canvas settings, and template library

import React from 'react';
import { DiagramContent, DiagramNode } from '@/types/review';
import { diagramTemplates } from './templates';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { Card } from '@/components/ui/card';
import { 
  MousePointer2,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Diamond,
  RectangleHorizontal,
  Link,
  Type,
  Palette,
  Grid3X3,
  Settings,
  FileText,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagramToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  canvas: DiagramContent['canvas'];
  onCanvasUpdate: (updates: Partial<DiagramContent['canvas']>) => void;
  selectedNodes: string[];
  onNodesUpdate: (nodes: DiagramNode[]) => void;
  onTemplateApply?: (templateNodes: DiagramNode[], templateConnections: any[]) => void;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  selectedTool,
  onToolChange,
  canvas,
  onCanvasUpdate,
  selectedNodes,
  onNodesUpdate,
  onTemplateApply
}) => {
  // Provide default canvas values if canvas is undefined
  const defaultCanvas = {
    width: 800,
    height: 600,
    backgroundColor: 'transparent',
    gridEnabled: true,
    gridSize: 20,
    gridColor: '#e5e7eb',
    snapToGrid: true
  };
  
  const safeCanvas = canvas || defaultCanvas;

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Selecionar' },
    { id: 'rectangle', icon: Square, label: 'Retângulo' },
    { id: 'rounded-rect', icon: RectangleHorizontal, label: 'Retângulo Arredondado' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'ellipse', icon: Circle, label: 'Elipse' },
    { id: 'diamond', icon: Diamond, label: 'Diamante' },
    { id: 'triangle', icon: Triangle, label: 'Triângulo' },
    { id: 'hexagon', icon: Hexagon, label: 'Hexágono' },
    { id: 'connect', icon: Link, label: 'Conectar' }
  ];

  const shapeCategoryColors = {
    'process': '#3b82f6',
    'decision': '#f59e0b',
    'start-end': '#10b981',
    'data': '#8b5cf6',
    'delay': '#ef4444',
    'custom': '#6b7280'
  };

  const handleTemplateSelect = (template: any) => {
    if (onTemplateApply) {
      onTemplateApply(template.nodes, template.connections);
    }
  };

  return (
    <div className="diagram-toolbar" style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}>
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-4" style={{ backgroundColor: '#1a1a1a' }}>
          <TabsTrigger value="tools" className="text-xs">Ferramentas</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
          <TabsTrigger value="canvas" className="text-xs">Tela</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4 p-4">
          {/* Main Tools */}
          <div className="flex flex-wrap gap-1">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onToolChange(tool.id)}
                  className="flex-shrink-0"
                  title={tool.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          <Separator style={{ backgroundColor: '#2a2a2a' }} />

          {/* Shape Templates by Category */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
              Elementos por Categoria
            </Label>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToolChange('rectangle')}
                className="justify-start"
                style={{ borderColor: shapeCategoryColors.process }}
              >
                <Square className="w-4 h-4 mr-2" style={{ color: shapeCategoryColors.process }} />
                Processo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToolChange('diamond')}
                className="justify-start"
                style={{ borderColor: shapeCategoryColors.decision }}
              >
                <Diamond className="w-4 h-4 mr-2" style={{ color: shapeCategoryColors.decision }} />
                Decisão
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToolChange('circle')}
                className="justify-start"
                style={{ borderColor: shapeCategoryColors['start-end'] }}
              >
                <Circle className="w-4 h-4 mr-2" style={{ color: shapeCategoryColors['start-end'] }} />
                Início/Fim
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToolChange('hexagon')}
                className="justify-start"
                style={{ borderColor: shapeCategoryColors.data }}
              >
                <Hexagon className="w-4 h-4 mr-2" style={{ color: shapeCategoryColors.data }} />
                Dados
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 p-4">
          <div className="space-y-4">
            {/* Dashboard Background Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
                <Monitor className="w-4 h-4 inline mr-2" />
                Cores do Dashboard
              </Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor de Fundo</Label>
                  <ColorPicker
                    value={safeCanvas.backgroundColor}
                    onChange={(color) => onCanvasUpdate({ backgroundColor: color })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor da Grade</Label>
                  <ColorPicker
                    value={safeCanvas.gridColor}
                    onChange={(color) => onCanvasUpdate({ gridColor: color })}
                  />
                </div>
              </div>
            </div>

            <Separator style={{ backgroundColor: '#2a2a2a' }} />

            {/* Node Styling */}
            {selectedNodes.length > 0 ? (
              <div className="space-y-4">
                <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
                  <Palette className="w-4 h-4 inline mr-2" />
                  Estilizar {selectedNodes.length} elemento(s) selecionado(s)
                </Label>
                
                {/* Quick Style Presets */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updates = selectedNodes.map(nodeId => ({
                        id: nodeId,
                        style: {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: '#3b82f6',
                          textColor: '#1e40af',
                          borderWidth: 2,
                          borderStyle: 'solid' as const,
                          fontSize: 14,
                          fontWeight: 'normal' as const,
                          textAlign: 'center' as const,
                          opacity: 1
                        }
                      }));
                      onNodesUpdate(updates as DiagramNode[]);
                    }}
                    className="text-xs"
                  >
                    Processo
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updates = selectedNodes.map(nodeId => ({
                        id: nodeId,
                        style: {
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderColor: '#f59e0b',
                          textColor: '#d97706',
                          borderWidth: 2,
                          borderStyle: 'solid' as const,
                          fontSize: 14,
                          fontWeight: 'bold' as const,
                          textAlign: 'center' as const,
                          opacity: 1
                        }
                      }));
                      onNodesUpdate(updates as DiagramNode[]);
                    }}
                    className="text-xs"
                  >
                    Decisão
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updates = selectedNodes.map(nodeId => ({
                        id: nodeId,
                        style: {
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderColor: '#22c55e',
                          textColor: '#16a34a',
                          borderWidth: 3,
                          borderStyle: 'solid' as const,
                          fontSize: 16,
                          fontWeight: 'bold' as const,
                          textAlign: 'center' as const,
                          opacity: 1
                        }
                      }));
                      onNodesUpdate(updates as DiagramNode[]);
                    }}
                    className="text-xs"
                  >
                    Destaque
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updates = selectedNodes.map(nodeId => ({
                        id: nodeId,
                        style: {
                          backgroundColor: 'transparent',
                          borderColor: '#6b7280',
                          textColor: '#374151',
                          borderWidth: 1,
                          borderStyle: 'solid' as const,
                          fontSize: 12,
                          fontWeight: 'normal' as const,
                          textAlign: 'center' as const,
                          opacity: 0.8
                        }
                      }));
                      onNodesUpdate(updates as DiagramNode[]);
                    }}
                    className="text-xs"
                  >
                    Sutil
                  </Button>
                </div>

                <Separator style={{ backgroundColor: '#2a2a2a' }} />

                {/* Manual Color Controls */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor de Fundo</Label>
                      <ColorPicker
                        value="#3b82f6"
                        onChange={(color) => {
                          const updates = selectedNodes.map(nodeId => ({
                            id: nodeId,
                            style: { backgroundColor: color }
                          }));
                          onNodesUpdate(updates as DiagramNode[]);
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor do Texto</Label>
                      <ColorPicker
                        value="#ffffff"
                        onChange={(color) => {
                          const updates = selectedNodes.map(nodeId => ({
                            id: nodeId,
                            style: { textColor: color }
                          }));
                          onNodesUpdate(updates as DiagramNode[]);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor da Borda</Label>
                      <ColorPicker
                        value="#3b82f6"
                        onChange={(color) => {
                          const updates = selectedNodes.map(nodeId => ({
                            id: nodeId,
                            style: { borderColor: color }
                          }));
                          onNodesUpdate(updates as DiagramNode[]);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-xs" style={{ color: '#d1d5db' }}>Espessura da Borda</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        defaultValue="2"
                        className="h-8"
                        onChange={(e) => {
                          const updates = selectedNodes.map(nodeId => ({
                            id: nodeId,
                            style: { borderWidth: Number(e.target.value) }
                          }));
                          onNodesUpdate(updates as DiagramNode[]);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecione elementos para estilizar</p>
              </div>
            )}

            <Separator style={{ backgroundColor: '#2a2a2a' }} />

            {/* Global Style Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
                Temas Predefinidos
              </Label>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCanvasUpdate({
                      backgroundColor: '#ffffff',
                      gridColor: '#e5e7eb'
                    });
                  }}
                  className="justify-start"
                >
                  <div className="w-4 h-4 mr-2 bg-white border rounded" />
                  Tema Claro
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCanvasUpdate({
                      backgroundColor: '#1f2937',
                      gridColor: '#374151'
                    });
                  }}
                  className="justify-start"
                >
                  <div className="w-4 h-4 mr-2 bg-gray-800 border rounded" />
                  Tema Escuro
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCanvasUpdate({
                      backgroundColor: 'transparent',
                      gridColor: '#e5e7eb'
                    });
                  }}
                  className="justify-start"
                >
                  <div className="w-4 h-4 mr-2 bg-transparent border-2 border-dashed rounded" />
                  Transparente
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="canvas" className="space-y-4 p-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
              Configurações da Tela
            </Label>
            
            {/* Canvas Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs" style={{ color: '#d1d5db' }}>Largura</Label>
                <Input
                  type="number"
                  value={safeCanvas.width}
                  onChange={(e) => onCanvasUpdate({ width: Number(e.target.value) })}
                  className="h-8"
                  min="400"
                  max="2000"
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: '#d1d5db' }}>Altura</Label>
                <Input
                  type="number"
                  value={safeCanvas.height}
                  onChange={(e) => onCanvasUpdate({ height: Number(e.target.value) })}
                  className="h-8"
                  min="300"
                  max="1500"
                />
              </div>
            </div>

            <Separator style={{ backgroundColor: '#2a2a2a' }} />

            {/* Grid Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm" style={{ color: '#ffffff' }}>Grade</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCanvasUpdate({ gridEnabled: !safeCanvas.gridEnabled })}
                  className={safeCanvas.gridEnabled ? 'text-blue-400' : 'text-gray-400'}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
              
              {safeCanvas.gridEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs" style={{ color: '#d1d5db' }}>Tamanho</Label>
                    <Input
                      type="number"
                      value={safeCanvas.gridSize}
                      onChange={(e) => onCanvasUpdate({ gridSize: Number(e.target.value) })}
                      className="h-8"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: '#d1d5db' }}>Ajustar à Grade</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCanvasUpdate({ snapToGrid: !safeCanvas.snapToGrid })}
                      className={safeCanvas.snapToGrid ? 'text-blue-400' : 'text-gray-400'}
                    >
                      {safeCanvas.snapToGrid ? 'Ativo' : 'Inativo'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 p-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
              <FileText className="w-4 h-4 inline mr-2" />
              Modelos de Diagrama
            </Label>
            
            <div className="grid grid-cols-1 gap-3">
              {diagramTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                  style={{ backgroundColor: '#2a2a2a', borderColor: '#374151' }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-400 capitalize">
                        {template.category.replace('-', ' ')}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
