
// ABOUTME: Customizable analytics dashboard with clean UI and advanced configuration options
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEnhancedAnalytics, AnalyticsFilters } from '@/hooks/useEnhancedAnalytics';
import { CustomizableChart } from './CustomizableChart';
import { MetricCard } from './MetricCard';
import { 
  Settings, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare, 
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  ChevronDown,
  Maximize2,
  Download
} from 'lucide-react';
import { subDays, format } from 'date-fns';

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  xAxis: string;
  yAxis: string;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
}

interface DashboardConfig {
  showOverviewCards: boolean;
  showCharts: boolean;
  charts: ChartConfig[];
  theme: 'light' | 'dark';
  animationsEnabled: boolean;
  refreshInterval: number;
}

const defaultChartConfigs: ChartConfig[] = [
  {
    id: 'daily-users',
    title: 'Usuários Ativos Diários',
    type: 'line',
    xAxis: 'date',
    yAxis: 'activeUsers',
    enabled: true,
    size: 'medium'
  },
  {
    id: 'page-views',
    title: 'Visualizações de Página',
    type: 'bar',
    xAxis: 'date',
    yAxis: 'pageViews',
    enabled: true,
    size: 'medium'
  },
  {
    id: 'user-retention',
    title: 'Retenção de Usuários',
    type: 'bar',
    xAxis: 'period',
    yAxis: 'percentage',
    enabled: true,
    size: 'small'
  },
  {
    id: 'content-engagement',
    title: 'Engajamento de Conteúdo',
    type: 'line',
    xAxis: 'date',
    yAxis: 'engagement',
    enabled: true,
    size: 'small'
  }
];

export const CustomizableAnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    },
    excludeAdmins: true,
    includeTestData: false
  });

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    showOverviewCards: true,
    showCharts: true,
    charts: defaultChartConfigs,
    theme: 'dark',
    animationsEnabled: true,
    refreshInterval: 300000 // 5 minutes
  });

  const { data: analytics, isLoading, error, refetch } = useEnhancedAnalytics(filters);

  const quickRanges = [
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Últimos 90 dias', days: 90 },
    { label: 'Último ano', days: 365 }
  ];

  const handleQuickRange = (days: number) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: subDays(new Date(), days),
        to: new Date()
      }
    }));
  };

  const updateChartConfig = (chartId: string, updates: Partial<ChartConfig>) => {
    setDashboardConfig(prev => ({
      ...prev,
      charts: prev.charts.map(chart => 
        chart.id === chartId ? { ...chart, ...updates } : chart
      )
    }));
  };

  const enabledCharts = useMemo(() => 
    dashboardConfig.charts.filter(chart => chart.enabled),
    [dashboardConfig.charts]
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-muted-foreground">Carregando analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <Activity className="w-5 h-5" />
            <span>Erro ao carregar dados de analytics</span>
          </div>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Control Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Analytics Dashboard
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* Date Range Quick Filters */}
                <div className="flex gap-1">
                  {quickRanges.map((range) => (
                    <Button
                      key={range.days}
                      variant={
                        Math.ceil((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) === range.days
                          ? "default" 
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => handleQuickRange(range.days)}
                      className="text-xs transition-all duration-200"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>

                {/* Settings Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Configurar
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-card border-border" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Filtros de Dados</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="exclude-admins"
                            checked={filters.excludeAdmins}
                            onCheckedChange={(checked) => 
                              setFilters(prev => ({ ...prev, excludeAdmins: checked }))
                            }
                          />
                          <Label htmlFor="exclude-admins" className="text-sm flex items-center gap-2">
                            {filters.excludeAdmins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            Excluir atividade de administradores
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="include-test"
                            checked={filters.includeTestData}
                            onCheckedChange={(checked) => 
                              setFilters(prev => ({ ...prev, includeTestData: checked }))
                            }
                          />
                          <Label htmlFor="include-test" className="text-sm">
                            Incluir dados de teste
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Exibição</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-overview"
                            checked={dashboardConfig.showOverviewCards}
                            onCheckedChange={(checked) => 
                              setDashboardConfig(prev => ({ ...prev, showOverviewCards: checked }))
                            }
                          />
                          <Label htmlFor="show-overview" className="text-sm">
                            Mostrar cards de resumo
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="animations"
                            checked={dashboardConfig.animationsEnabled}
                            onCheckedChange={(checked) => 
                              setDashboardConfig(prev => ({ ...prev, animationsEnabled: checked }))
                            }
                          />
                          <Label htmlFor="animations" className="text-sm">
                            Habilitar animações
                          </Label>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="text-sm text-muted-foreground">
              Período: {format(filters.dateRange.from, 'dd/MM/yyyy')} - {format(filters.dateRange.to, 'dd/MM/yyyy')}
              {filters.excludeAdmins && " • Excluindo administradores"}
              {filters.includeTestData && " • Incluindo dados de teste"}
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        {dashboardConfig.showOverviewCards && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Usuários"
              value={analytics.userEngagement.totalUsers.value}
              trend={analytics.userEngagement.totalUsers.trend}
              icon={<Users className="w-5 h-5 text-blue-400" />}
              description={analytics.userEngagement.totalUsers.description}
              calculation={analytics.userEngagement.totalUsers.calculation}
              dataSource={analytics.userEngagement.totalUsers.dataSource}
              animated={dashboardConfig.animationsEnabled}
            />
            
            <MetricCard
              title="Issues Publicadas"
              value={analytics.contentMetrics.publishedIssues.value}
              trend={analytics.contentMetrics.publishedIssues.trend}
              icon={<FileText className="w-5 h-5 text-green-400" />}
              description={analytics.contentMetrics.publishedIssues.description}
              calculation={analytics.contentMetrics.publishedIssues.calculation}
              dataSource={analytics.contentMetrics.publishedIssues.dataSource}
              animated={dashboardConfig.animationsEnabled}
            />
            
            <MetricCard
              title="Discussões Ativas"
              value={analytics.communityActivity.activeDiscussions.value}
              trend={analytics.communityActivity.activeDiscussions.trend}
              icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
              description={analytics.communityActivity.activeDiscussions.description}
              calculation={analytics.communityActivity.activeDiscussions.calculation}
              dataSource={analytics.communityActivity.activeDiscussions.dataSource}
              animated={dashboardConfig.animationsEnabled}
            />
            
            <MetricCard
              title="Performance"
              value={`${analytics.technicalMetrics.uptimePercentage.value}%`}
              trend={analytics.technicalMetrics.uptimePercentage.trend}
              icon={<Activity className="w-5 h-5 text-yellow-400" />}
              description={analytics.technicalMetrics.uptimePercentage.description}
              calculation={analytics.technicalMetrics.uptimePercentage.calculation}
              dataSource={analytics.technicalMetrics.uptimePercentage.dataSource}
              animated={dashboardConfig.animationsEnabled}
            />
          </div>
        )}

        {/* Customizable Charts Grid */}
        {dashboardConfig.showCharts && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enabledCharts.map((chartConfig) => (
              <Card 
                key={chartConfig.id} 
                className={`bg-card border-border transition-all duration-300 hover:shadow-lg ${
                  dashboardConfig.animationsEnabled ? 'animate-scale-in' : ''
                } ${
                  chartConfig.size === 'small' ? 'lg:col-span-1' : 
                  chartConfig.size === 'large' ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      {chartConfig.type === 'line' && <LineChart className="w-4 h-4 text-primary" />}
                      {chartConfig.type === 'bar' && <BarChart3 className="w-4 h-4 text-primary" />}
                      {chartConfig.type === 'pie' && <PieChart className="w-4 h-4 text-primary" />}
                      {chartConfig.title}
                    </CardTitle>
                    
                    <div className="flex items-center gap-1">
                      {/* Chart Type Selector */}
                      <Select
                        value={chartConfig.type}
                        onValueChange={(type: 'line' | 'bar' | 'pie' | 'area') => 
                          updateChartConfig(chartConfig.id, { type })
                        }
                      >
                        <SelectTrigger className="w-auto h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">
                            <div className="flex items-center gap-2">
                              <LineChart className="w-3 h-3" />
                              Linha
                            </div>
                          </SelectItem>
                          <SelectItem value="bar">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-3 h-3" />
                              Barras
                            </div>
                          </SelectItem>
                          <SelectItem value="pie">
                            <div className="flex items-center gap-2">
                              <PieChart className="w-3 h-3" />
                              Pizza
                            </div>
                          </SelectItem>
                          <SelectItem value="area">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              Área
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateChartConfig(chartConfig.id, { enabled: false })}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CustomizableChart
                    config={chartConfig}
                    data={analytics}
                    animated={dashboardConfig.animationsEnabled}
                    onConfigChange={(updates) => updateChartConfig(chartConfig.id, updates)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Hidden Charts Management */}
        {dashboardConfig.charts.some(chart => !chart.enabled) && (
          <Card className="bg-card border-border border-dashed">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Gráficos Ocultos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dashboardConfig.charts
                  .filter(chart => !chart.enabled)
                  .map((chart) => (
                    <Button
                      key={chart.id}
                      variant="outline"
                      size="sm"
                      onClick={() => updateChartConfig(chart.id, { enabled: true })}
                      className="gap-2"
                    >
                      <EyeOff className="w-3 h-3" />
                      {chart.title}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};
