
// ABOUTME: Comprehensive toolbar for diagram creation with shape tools and styling options
// Provides access to node types, styling, canvas settings, and advanced features

import React from 'react';
import { DiagramContent, DiagramNode } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
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
  Undo,
  Redo,
  Copy,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagramToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  canvas: DiagramContent['canvas'];
  onCanvasUpdate: (updates: Partial<DiagramContent['canvas']>) => void;
  selectedNodes: string[];
  onNodesUpdate: (nodes: DiagramNode[]) => void;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  selectedTool,
  onToolChange,
  canvas,
  onCanvasUpdate,
  selectedNodes,
  onNodesUpdate
}) => {
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
    'process': '#3b82f6',      // Blue - for process steps
    'decision': '#f59e0b',     // Orange - for decision points
    'start-end': '#10b981',    // Green - for start/end points
    'data': '#8b5cf6',         // Purple - for data/input
    'delay': '#ef4444',        // Red - for delays/problems
    'custom': '#6b7280'        // Gray - for custom elements
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
          {selectedNodes.length > 0 ? (
            <div className="space-y-4">
              <Label className="text-sm font-medium" style={{ color: '#ffffff' }}>
                Estilizar {selectedNodes.length} elemento(s) selecionado(s)
              </Label>
              
              {/* Quick Style Presets */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply process style
                    const updates = selectedNodes.map(nodeId => ({
                      id: nodeId,
                      style: {
                        backgroundColor: '#3b82f6',
                        borderColor: '#1d4ed8',
                        textColor: '#ffffff',
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
                    // Apply decision style
                    const updates = selectedNodes.map(nodeId => ({
                      id: nodeId,
                      style: {
                        backgroundColor: '#f59e0b',
                        borderColor: '#d97706',
                        textColor: '#ffffff',
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
                    // Apply highlight style
                    const updates = selectedNodes.map(nodeId => ({
                      id: nodeId,
                      style: {
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        textColor: '#ffffff',
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
              </div>

              <Separator style={{ backgroundColor: '#2a2a2a' }} />

              {/* Manual Color Controls */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor de Fundo</Label>
                    <ColorPicker
                      color="#3b82f6"
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
                      color="#ffffff"
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
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Selecione elementos para estilizar</p>
            </div>
          )}
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
                  value={canvas.width}
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
                  value={canvas.height}
                  onChange={(e) => onCanvasUpdate({ height: Number(e.target.value) })}
                  className="h-8"
                  min="300"
                  max="1500"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <Label className="text-xs" style={{ color: '#d1d5db' }}>Cor de Fundo</Label>
              <ColorPicker
                color={canvas.backgroundColor}
                onChange={(color) => onCanvasUpdate({ backgroundColor: color })}
              />
            </div>

            <Separator style={{ backgroundColor: '#2a2a2a' }} />

            {/* Grid Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm" style={{ color: '#ffffff' }}>Grade</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCanvasUpdate({ gridEnabled: !canvas.gridEnabled })}
                  className={canvas.gridEnabled ? 'text-blue-400' : 'text-gray-400'}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
              
              {canvas.gridEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs" style={{ color: '#d1d5db' }}>Tamanho</Label>
                    <Input
                      type="number"
                      value={canvas.gridSize}
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
                      onClick={() => onCanvasUpdate({ snapToGrid: !canvas.snapToGrid })}
                      className={canvas.snapToGrid ? 'text-blue-400' : 'text-gray-400'}
                    >
                      {canvas.snapToGrid ? 'Ativo' : 'Inativo'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 p-4">
          <div className="text-center text-gray-400 py-8">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Modelos serão implementados</p>
            <p className="text-xs">Flowcharts, árvores de decisão, etc.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
