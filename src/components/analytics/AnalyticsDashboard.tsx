
// ABOUTME: Comprehensive analytics dashboard for admin panel
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
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
  CheckCircle
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useAnalyticsData();

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
            <span>Erro ao carregar dados de analytics</span>
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.userEngagement.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Issues Publicadas</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.contentMetrics.publishedIssues}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Discussões Ativas</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.communityActivity.activeDiscussions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-gray-400">Performance</p>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-2xl font-bold text-white">
                    {analytics.performance.uptimePercentage}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
