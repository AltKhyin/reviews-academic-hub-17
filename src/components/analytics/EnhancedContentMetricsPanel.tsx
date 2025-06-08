
// ABOUTME: Enhanced content metrics panel with detailed content analysis
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, Eye, Clock, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from '@/hooks/useEnhancedAnalytics';

interface EnhancedContentMetricsPanelProps {
  data: any;
  dateRange: DateRange;
}

export const EnhancedContentMetricsPanel: React.FC<EnhancedContentMetricsPanelProps> = ({ data, dateRange }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Issues Totais</p>
                <p className="text-xl font-bold text-white">{data.totalIssues.value}</p>
                <p className="text-xs text-gray-400">
                  {data.publishedIssues.value} publicadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Conteúdo em Destaque</p>
                <p className="text-xl font-bold text-white">{data.featuredIssues.value}</p>
                <p className="text-xs text-gray-400">
                  {((Number(data.featuredIssues.value) / Number(data.publishedIssues.value)) * 100).toFixed(1)}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Engajamento Médio</p>
                <p className="text-xl font-bold text-white">{Number(data.contentEngagement.value).toFixed(1)}</p>
                <p className="text-xs text-gray-400">views por issue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Tempo de Leitura</p>
                <p className="text-xl font-bold text-white">
                  {Math.floor(Number(data.averageReadingTime.value) / 60)}m {Number(data.averageReadingTime.value) % 60}s
                </p>
                <p className="text-xs text-gray-400">tempo médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publications Timeline */}
      <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Publicações no Período
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Histórico de publicações e conteúdo em destaque
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.recentPublications}>
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
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Publicações"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="featuredCount" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Destaques"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Viewed Issues and Specialty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Issues Mais Visualizadas</CardTitle>
            <p className="text-gray-400 text-sm">Top 10 conteúdos por engajamento</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.mostViewedIssues.map((issue: any, index: number) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {index + 1}. {issue.title}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span>{issue.views} views</span>
                      <span>{issue.uniqueViews} únicos</span>
                      <span>{Math.round(issue.avgTimeOnPage)}s leitura</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">
                      {issue.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400">conversão</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Distribuição por Especialidade</CardTitle>
            <p className="text-gray-400 text-sm">Conteúdo organizado por área médica</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.issuesBySpecialty}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="specialty"
                >
                  {data.issuesBySpecialty.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                  formatter={(value: any, name: string) => [
                    `${value} issues`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {data.issuesBySpecialty.map((item: any, index: number) => (
                <div key={item.specialty} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-300 truncate">{item.specialty}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">{item.count}</span>
                    <span className="text-gray-400 ml-2">{item.avgViews} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
