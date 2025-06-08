// ABOUTME: Analytics playground sidebar with chart creation controls
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface PlaygroundChart {
  id: string;
  name: string;
  xAxis: string;
  yAxis: string;
  chartType: 'line' | 'bar' | 'area' | 'pie';
  events: string[];
}

interface PlaygroundSidebarProps {
  availableEvents: string[];
  onCreateChart: (chart: Omit<PlaygroundChart, 'id'>) => void;
  onDeleteChart: (chartId: string) => void;
  existingCharts: PlaygroundChart[];
  selectedChart: string | null;
  onSelectChart: (chartId: string | null) => void;
}

export const PlaygroundSidebar: React.FC<PlaygroundSidebarProps> = ({
  availableEvents,
  onCreateChart,
  onDeleteChart,
  existingCharts,
  selectedChart,
  onSelectChart
}) => {
  const [newChart, setNewChart] = React.useState<Partial<PlaygroundChart>>({
    chartType: 'line',
    events: []
  });

  const [isCreateOpen, setIsCreateOpen] = React.useState(true);
  const [isChartsOpen, setIsChartsOpen] = React.useState(true);

  const handleCreateChart = () => {
    if (newChart.name && newChart.xAxis && newChart.yAxis && newChart.events?.length) {
      onCreateChart({
        name: newChart.name,
        xAxis: newChart.xAxis,
        yAxis: newChart.yAxis,
        chartType: newChart.chartType || 'line',
        events: newChart.events
      });
      setNewChart({ chartType: 'line', events: [] });
    }
  };

  const toggleEvent = (event: string) => {
    const events = newChart.events || [];
    if (events.includes(event)) {
      setNewChart(prev => ({ 
        ...prev, 
        events: events.filter(e => e !== event) 
      }));
    } else {
      setNewChart(prev => ({ 
        ...prev, 
        events: [...events, event] 
      }));
    }
  };

  return (
    <div className="w-80 h-full overflow-y-auto border-r border-gray-600 bg-gray-900/50 p-4 space-y-4">
      {/* Chart Creation Section */}
      <Collapsible open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <CollapsibleTrigger asChild>
          <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }} className="cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Novo Gráfico
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCreateOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <CardContent className="p-4 space-y-4">
              {/* Chart Name */}
              <div>
                <Label className="text-gray-300 text-xs">Nome do Gráfico</Label>
                <Input
                  value={newChart.name || ''}
                  onChange={(e) => setNewChart(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 bg-gray-800 border-gray-600 text-white text-sm"
                  placeholder="Ex: Atividade Mensal"
                />
              </div>
              
              {/* Chart Type */}
              <div>
                <Label className="text-gray-300 text-xs">Tipo de Gráfico</Label>
                <Select
                  value={newChart.chartType}
                  onValueChange={(value: any) => setNewChart(prev => ({ ...prev, chartType: value }))}
                >
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Linha</SelectItem>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                    <SelectItem value="pie">Pizza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Axis Configuration */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-gray-300 text-xs">Eixo X</Label>
                  <Select
                    value={newChart.xAxis}
                    onValueChange={(value) => setNewChart(prev => ({ ...prev, xAxis: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white text-sm">
                      <SelectValue placeholder="Selecionar eixo X" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="user_type">Tipo de Usuário</SelectItem>
                      <SelectItem value="content_type">Tipo de Conteúdo</SelectItem>
                      <SelectItem value="category">Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300 text-xs">Eixo Y</Label>
                  <Select
                    value={newChart.yAxis}
                    onValueChange={(value) => setNewChart(prev => ({ ...prev, yAxis: value }))}
                  >
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white text-sm">
                      <SelectValue placeholder="Selecionar eixo Y" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Contagem</SelectItem>
                      <SelectItem value="percentage">Porcentagem</SelectItem>
                      <SelectItem value="average">Média</SelectItem>
                      <SelectItem value="total">Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Events Selection */}
              <div>
                <Label className="text-gray-300 text-xs">Eventos para Analisar</Label>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {availableEvents.map(event => (
                    <label 
                      key={event} 
                      className="flex items-center space-x-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={newChart.events?.includes(event) || false}
                        onChange={() => toggleEvent(event)}
                        className="rounded text-xs"
                      />
                      <span className="text-gray-300">{event.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateChart}
                disabled={!newChart.name || !newChart.xAxis || !newChart.yAxis || !newChart.events?.length}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                Criar Gráfico
              </Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Existing Charts Section */}
      <Collapsible open={isChartsOpen} onOpenChange={setIsChartsOpen}>
        <CollapsibleTrigger asChild>
          <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }} className="cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between text-sm">
                Gráficos Criados ({existingCharts.length})
                <ChevronDown className={`w-4 h-4 transition-transform ${isChartsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="space-y-2">
            {existingCharts.length === 0 ? (
              <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                <CardContent className="p-4 text-center">
                  <p className="text-gray-400 text-xs">Nenhum gráfico criado ainda</p>
                </CardContent>
              </Card>
            ) : (
              existingCharts.map(chart => (
                <Card 
                  key={chart.id} 
                  style={{ backgroundColor: selectedChart === chart.id ? '#2a4a6b' : '#1a1a1a', borderColor: '#2a2a2a' }}
                  className="cursor-pointer hover:bg-gray-800/50"
                  onClick={() => onSelectChart(selectedChart === chart.id ? null : chart.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{chart.name}</h4>
                        <div className="text-xs text-gray-400 space-y-1 mt-1">
                          <div>Tipo: {chart.chartType}</div>
                          <div>X: {chart.xAxis}</div>
                          <div>Y: {chart.yAxis}</div>
                          <div>Eventos: {chart.events.length}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChart(chart.id);
                        }}
                        className="ml-2 h-6 w-6 p-0 text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
