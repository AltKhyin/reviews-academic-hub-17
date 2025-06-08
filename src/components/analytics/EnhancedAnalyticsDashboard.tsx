
// ABOUTME: Enhanced analytics dashboard with verified metrics, customizable charts, and playground
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVerifiedAnalytics, AnalyticsMetric } from '@/hooks/useVerifiedAnalytics';
import { UserEngagementPanel } from './UserEngagementPanel';
import { ContentMetricsPanel } from './ContentMetricsPanel';
import { CommunityActivityPanel } from './CommunityActivityPanel';
import { PerformancePanel } from './PerformancePanel';
import { SystemHealthPanel } from './SystemHealthPanel';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Activity, 
  Server,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar as CalendarIcon,
  Settings,
  BarChart3,
  Info
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface PlaygroundChart {
  id: string;
  name: string;
  xAxis: string;
  yAxis: string;
  chartType: 'line' | 'bar' | 'area' | 'pie';
  events: string[];
}

export const EnhancedAnalyticsDashboard: React.FC = () => {
  // Analytics filters state
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [excludeAdminData, setExcludeAdminData] = useState(true);
  
  // Playground state
  const [playgroundCharts, setPlaygroundCharts] = useState<PlaygroundChart[]>([]);
  const [newChart, setNewChart] = useState<Partial<PlaygroundChart>>({
    chartType: 'line',
    events: []
  });

  const { data: analytics, isLoading, error } = useVerifiedAnalytics({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    excludeAdminData
  });

  // Metric card component with tooltip
  const MetricCard: React.FC<{ metric: AnalyticsMetric }> = ({ metric }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }} className="cursor-help">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  {metric.icon === 'users' && <Users className="w-5 h-5 text-blue-400" />}
                  {metric.icon === 'file-text' && <FileText className="w-5 h-5 text-green-400" />}
                  {metric.icon === 'message-square' && <MessageSquare className="w-5 h-5 text-purple-400" />}
                  {metric.icon === 'trending-up' && <TrendingUp className="w-5 h-5 text-yellow-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-400">{metric.label}</p>
                    <Info className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                  {metric.trend && (
                    <div className="flex items-center mt-1 space-x-1">
                      <span className={cn(
                        "text-xs",
                        metric.trend.direction === 'up' ? 'text-green-400' : 
                        metric.trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
                      )}>
                        {metric.trend.direction === 'up' ? '↗' : 
                         metric.trend.direction === 'down' ? '↘' : '→'} 
                        {metric.trend.value}%
                      </span>
                      <span className="text-xs text-gray-500">vs {metric.trend.period}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">{metric.label}</h4>
            <p className="text-sm text-gray-300">{metric.description}</p>
            <div className="pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-400">
                <strong>Cálculo:</strong> {metric.calculation}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Create new playground chart
  const createPlaygroundChart = () => {
    if (newChart.name && newChart.xAxis && newChart.yAxis && newChart.events?.length) {
      const chart: PlaygroundChart = {
        id: Date.now().toString(),
        name: newChart.name,
        xAxis: newChart.xAxis,
        yAxis: newChart.yAxis,
        chartType: newChart.chartType || 'line',
        events: newChart.events
      };
      setPlaygroundCharts(prev => [...prev, chart]);
      setNewChart({ chartType: 'line', events: [] });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-gray-400">Carregando dados de analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Erro ao carregar dados de analytics: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            Nenhum dado de analytics disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Panel */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Controles de Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label className="text-gray-300">Período de Dados</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.startDate && "text-muted-foreground"
                      )}
                      style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.startDate ? format(dateRange.startDate, "dd/MM/yyyy") : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.startDate}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.endDate && "text-muted-foreground"
                      )}
                      style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.endDate ? format(dateRange.endDate, "dd/MM/yyyy") : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.endDate}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Admin Data Filter */}
            <div className="space-y-2">
              <Label className="text-gray-300">Filtros de Dados</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="exclude-admin"
                  checked={excludeAdminData}
                  onCheckedChange={setExcludeAdminData}
                />
                <Label htmlFor="exclude-admin" className="text-sm text-gray-400">
                  Excluir dados de administradores
                </Label>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="space-y-2">
              <Label className="text-gray-300">Períodos Rápidos</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDateRange({
                    startDate: subDays(new Date(), 7),
                    endDate: new Date()
                  })}
                  style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                >
                  7 dias
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDateRange({
                    startDate: subDays(new Date(), 30),
                    endDate: new Date()
                  })}
                  style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                >
                  30 dias
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDateRange({
                    startDate: subDays(new Date(), 90),
                    endDate: new Date()
                  })}
                  style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
                >
                  90 dias
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards with Tooltips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.overview.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Detailed Analytics Tabs */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-white">Analytics Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="w-full">
            <TabsList className="grid w-full grid-cols-6" style={{ backgroundColor: '#2a2a2a' }}>
              <TabsTrigger value="engagement" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Engajamento
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comunidade
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="playground" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Playground
              </TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="mt-6">
              <UserEngagementPanel data={analytics.userEngagement} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <ContentMetricsPanel data={analytics.contentMetrics} />
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <CommunityActivityPanel data={analytics.communityActivity} />
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <PerformancePanel data={analytics.performance} />
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <SystemHealthPanel data={analytics.systemHealth} />
            </TabsContent>

            <TabsContent value="playground" className="mt-6">
              <div className="space-y-6">
                {/* Chart Creator */}
                <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                  <CardHeader>
                    <CardTitle className="text-white">Criar Gráfico Personalizado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-300">Nome do Gráfico</Label>
                        <input
                          type="text"
                          value={newChart.name || ''}
                          onChange={(e) => setNewChart(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 mt-1 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="Ex: Atividade Mensal"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">Tipo de Gráfico</Label>
                        <Select
                          value={newChart.chartType}
                          onValueChange={(value: any) => setNewChart(prev => ({ ...prev, chartType: value }))}
                        >
                          <SelectTrigger className="mt-1 bg-gray-800 border-gray-600">
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

                      <div>
                        <Label className="text-gray-300">Eixo X</Label>
                        <Select
                          value={newChart.xAxis}
                          onValueChange={(value) => setNewChart(prev => ({ ...prev, xAxis: value }))}
                        >
                          <SelectTrigger className="mt-1 bg-gray-800 border-gray-600">
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
                        <Label className="text-gray-300">Eixo Y</Label>
                        <Select
                          value={newChart.yAxis}
                          onValueChange={(value) => setNewChart(prev => ({ ...prev, yAxis: value }))}
                        >
                          <SelectTrigger className="mt-1 bg-gray-800 border-gray-600">
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

                    <div>
                      <Label className="text-gray-300">Eventos para Analisar</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                        {analytics.availableEvents.map(event => (
                          <label key={event} className="flex items-center space-x-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={newChart.events?.includes(event) || false}
                              onChange={(e) => {
                                const events = newChart.events || [];
                                if (e.target.checked) {
                                  setNewChart(prev => ({ 
                                    ...prev, 
                                    events: [...events, event] 
                                  }));
                                } else {
                                  setNewChart(prev => ({ 
                                    ...prev, 
                                    events: events.filter(e => e !== event) 
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">{event.replace(/_/g, ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={createPlaygroundChart}
                      disabled={!newChart.name || !newChart.xAxis || !newChart.yAxis || !newChart.events?.length}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Criar Gráfico
                    </Button>
                  </CardContent>
                </Card>

                {/* Created Charts */}
                {playgroundCharts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Gráficos Personalizados</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {playgroundCharts.map(chart => (
                        <Card key={chart.id} style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-base">{chart.name}</CardTitle>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPlaygroundCharts(prev => prev.filter(c => c.id !== chart.id))}
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              Remover
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-gray-400 space-y-1">
                              <p><strong>Tipo:</strong> {chart.chartType}</p>
                              <p><strong>X:</strong> {chart.xAxis}</p>
                              <p><strong>Y:</strong> {chart.yAxis}</p>
                              <p><strong>Eventos:</strong> {chart.events.join(', ')}</p>
                            </div>
                            <div className="mt-4 h-48 bg-gray-800/50 rounded flex items-center justify-center text-gray-500">
                              Gráfico seria renderizado aqui
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
