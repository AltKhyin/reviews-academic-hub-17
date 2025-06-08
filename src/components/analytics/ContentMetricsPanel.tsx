
// ABOUTME: Content metrics analytics panel for tracking issues and publications
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Star, TrendingUp, BookOpen } from 'lucide-react';

interface ContentMetricsData {
  totalIssues: number;
  publishedIssues: number;
  featuredIssues: number;
  mostViewedIssues: { id: string; title: string; views: number }[];
  issuesBySpecialty: { specialty: string; count: number }[];
  recentPublications: { date: string; count: number }[];
}

interface ContentMetricsPanelProps {
  data: ContentMetricsData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ContentMetricsPanel: React.FC<ContentMetricsPanelProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Overview */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Visão Geral do Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Total de Issues</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.totalIssues}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Issues Publicadas</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.publishedIssues}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">Issues em Destaque</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.featuredIssues}
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Taxa de Publicação</span>
              <span className="text-lg font-semibold text-blue-400">
                {data.totalIssues > 0 ? 
                  ((data.publishedIssues / data.totalIssues) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Publications */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Publicações Recentes (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.recentPublications}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                stroke="#888"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Issues by Specialty */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Issues por Especialidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.issuesBySpecialty}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.issuesBySpecialty.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Viewed Issues */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Issues Mais Visualizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.mostViewedIssues.map((issue, index) => (
              <div key={issue.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-sm text-gray-400">#{index + 1}</span>
                  <span className="text-white font-medium truncate" title={issue.title}>
                    {issue.title.length > 40 ? `${issue.title.substring(0, 40)}...` : issue.title}
                  </span>
                </div>
                <span className="text-blue-400 font-semibold ml-2">
                  {issue.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
