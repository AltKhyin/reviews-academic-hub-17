
// ABOUTME: Enhanced user engagement panel with detailed metrics and visualizations
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, Eye, Target } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from '@/hooks/useEnhancedAnalytics';

interface EnhancedUserEngagementPanelProps {
  data: any;
  dateRange: DateRange;
}

export const EnhancedUserEngagementPanel: React.FC<EnhancedUserEngagementPanelProps> = ({ data, dateRange }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Active Users Chart */}
      <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Usuários Ativos Diários
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Usuários únicos com atividade registrada por dia
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(date) => format(new Date(date), 'dd/MM')}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                labelStyle={{ color: '#1F2937' }}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                formatter={(value: any, name: string) => [
                  `${value} usuários`,
                  'Usuários Ativos'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Novos Usuários</p>
                <p className="text-xl font-bold text-white">{data.newUsersThisPeriod.value}</p>
                {data.newUsersThisPeriod.trend && (
                  <p className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{data.newUsersThisPeriod.trend.percentage}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Tempo Médio de Sessão</p>
                <p className="text-xl font-bold text-white">
                  {Math.floor(Number(data.averageSessionTime.value) / 60)}m {Number(data.averageSessionTime.value) % 60}s
                </p>
                {data.averageSessionTime.trend && (
                  <p className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{data.averageSessionTime.trend.percentage}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Visualizações</p>
                <p className="text-xl font-bold text-white">{data.pageViews.value}</p>
                <p className="text-xs text-gray-400">
                  {data.uniquePageViews.value} únicas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Taxa de Conversão</p>
                <p className="text-xl font-bold text-white">
                  {((Number(data.uniquePageViews.value) / Number(data.pageViews.value)) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">páginas únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages and User Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Páginas Mais Visitadas</CardTitle>
            <p className="text-gray-400 text-sm">Tráfego por página no período selecionado</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topPages} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis type="category" dataKey="page" stroke="#9CA3AF" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                  formatter={(value: any, name: string) => [
                    `${value} visualizações`,
                    name === 'views' ? 'Total' : 'Únicas'
                  ]}
                />
                <Bar dataKey="views" fill="#3B82F6" />
                <Bar dataKey="uniqueViews" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Retenção de Usuários</CardTitle>
            <p className="text-gray-400 text-sm">Percentual de usuários que retornam</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.userRetention}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="percentage"
                  nameKey="period"
                >
                  {data.userRetention.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                  formatter={(value: any, name: string) => [
                    `${value}%`,
                    `Retenção em ${name}`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.userRetention.map((item: any, index: number) => (
                <div key={item.period} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-300">{item.period}</span>
                  </div>
                  <span className="text-white font-semibold">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
