
// ABOUTME: Enhanced analytics dashboard with date ranges, filtering, and detailed metrics
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRange } from '@/hooks/useEnhancedAnalytics';
import { useEnhancedAnalytics, AnalyticsFilters } from '@/hooks/useEnhancedAnalytics';
import { EnhancedUserEngagementPanel } from './EnhancedUserEngagementPanel';
import { EnhancedContentMetricsPanel } from './EnhancedContentMetricsPanel';
import { Calendar, CalendarDays, Filter, TrendingUp, AlertCircle, CheckCircle, Info, Users, FileText, MessageSquare, Activity, Server, Settings, Eye, EyeOff } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const EnhancedAnalyticsDashboard: React.FC = () => {
  // State for analytics filters
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    },
    excludeAdmins: true,
    includeTestData: false
  });

  const { data: analytics, isLoading, error, refetch } = useEnhancedAnalytics(filters);

  // Quick date range presets
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

  const MetricCard: React.FC<{
    title: string;
    metric: any;
    icon: React.ReactNode;
    className?: string;
  }> = ({ title, metric, icon, className = '' }) => (
    <Card className={`${className}`} style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-white">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </p>
                {metric.trend && (
                  <div className={`flex items-center text-sm ${
                    metric.trend.direction === 'up' ? 'text-green-400' : 
                    metric.trend.direction === 'down' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {metric.trend.percentage}%
                  </div>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-3 bg-gray-900 text-white">
                      <div className="space-y-2">
                        <p className="font-medium">{metric.description}</p>
                        <p className="text-sm text-gray-300">
                          <strong>Cálculo:</strong> {metric.calculation}
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong>Fonte:</strong> {metric.dataSource}
                        </p>
                        <p className="text-xs text-gray-400">
                          Atualizado: {format(new Date(metric.lastUpdated), 'dd/MM/yyyy HH:mm')}
                        </p>
                        {metric.trend && (
                          <p className="text-xs text-gray-400">
                            Comparado com: {metric.trend.comparisonPeriod}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
        <div className="text-center text-gray-400">Carregando analytics avançados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Erro ao carregar dados de analytics</span>
          </div>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
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
      {/* Enhanced Filter Controls */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Configurações de Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Período de Análise</Label>
            <div className="flex flex-wrap gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.days}
                  variant={
                    Math.ceil((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) === range.days
                      ? "default" 
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleQuickRange(range.days)}
                  className="text-sm"
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              Período atual: {format(filters.dateRange.from, 'dd/MM/yyyy')} - {format(filters.dateRange.to, 'dd/MM/yyyy')}
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="exclude-admins"
                checked={filters.excludeAdmins}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, excludeAdmins: checked }))
                }
              />
              <Label htmlFor="exclude-admins" className="text-gray-300 flex items-center gap-2">
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
              <Label htmlFor="include-test" className="text-gray-300">
                Incluir dados de teste
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Usuários Totais"
          metric={analytics.userEngagement.totalUsers}
          icon={<Users className="w-5 h-5 text-blue-400" />}
        />
        
        <MetricCard
          title="Issues Publicadas"
          metric={analytics.contentMetrics.publishedIssues}
          icon={<FileText className="w-5 h-5 text-green-400" />}
        />
        
        <MetricCard
          title="Posts da Comunidade"
          metric={analytics.communityActivity.totalPosts}
          icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
        />
        
        <MetricCard
          title="Uptime do Sistema"
          metric={analytics.technicalMetrics.uptimePercentage}
          icon={<Activity className="w-5 h-5 text-yellow-400" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Novos Usuários"
          metric={analytics.userEngagement.newUsersThisPeriod}
          icon={<Users className="w-5 h-5 text-blue-300" />}
        />
        
        <MetricCard
          title="Visualizações Únicas"
          metric={analytics.userEngagement.uniquePageViews}
          icon={<Eye className="w-5 h-5 text-green-300" />}
        />
        
        <MetricCard
          title="Engajamento Médio"
          metric={analytics.communityActivity.engagementRate}
          icon={<TrendingUp className="w-5 h-5 text-purple-300" />}
        />
        
        <MetricCard
          title="Uso de Memória"
          metric={analytics.systemHealth.memoryUsage}
          icon={<Server className="w-5 h-5 text-yellow-300" />}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-white">Analytics Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="w-full">
            <TabsList className="grid w-full grid-cols-5" style={{ backgroundColor: '#2a2a2a' }}>
              <TabsTrigger value="engagement" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comunidade
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Técnico
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="mt-6">
              <EnhancedUserEngagementPanel data={analytics.userEngagement} dateRange={filters.dateRange} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <EnhancedContentMetricsPanel data={analytics.contentMetrics} dateRange={filters.dateRange} />
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Atividade da Comunidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Posts Totais</span>
                        <span className="text-white font-semibold">{analytics.communityActivity.totalPosts.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Comentários</span>
                        <span className="text-white font-semibold">{analytics.communityActivity.totalComments.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Discussões Ativas</span>
                        <span className="text-white font-semibold">{analytics.communityActivity.activeDiscussions.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Moderação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Itens Pendentes</span>
                        <span className="text-white font-semibold">{analytics.communityActivity.moderationStats.value}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Taxa de Engajamento</span>
                        <span className="text-white font-semibold">{analytics.communityActivity.engagementRate.value}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Tempo de Carregamento"
                  metric={analytics.technicalMetrics.averageLoadTime}
                  icon={<Activity className="w-5 h-5 text-blue-400" />}
                  className="bg-gray-900"
                />
                
                <MetricCard
                  title="Taxa de Erro"
                  metric={analytics.technicalMetrics.errorRate}
                  icon={<AlertCircle className="w-5 h-5 text-red-400" />}
                  className="bg-gray-900"
                />
                
                <MetricCard
                  title="Cache Hit Rate"
                  metric={analytics.technicalMetrics.cacheHitRate}
                  icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                  className="bg-gray-900"
                />
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Tamanho do BD"
                  metric={analytics.systemHealth.totalDbSize}
                  icon={<Server className="w-5 h-5 text-purple-400" />}
                  className="bg-gray-900"
                />
                
                <MetricCard
                  title="Conexões Ativas"
                  metric={analytics.systemHealth.activeConnections}
                  icon={<Activity className="w-5 h-5 text-blue-400" />}
                  className="bg-gray-900"
                />
                
                <MetricCard
                  title="Último Backup"
                  metric={analytics.systemHealth.lastBackup}
                  icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                  className="bg-gray-900"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
