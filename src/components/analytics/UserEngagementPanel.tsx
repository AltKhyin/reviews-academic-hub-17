
// ABOUTME: User engagement analytics panel with charts and metrics
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, UserPlus, Clock, Eye } from 'lucide-react';

interface UserEngagementData {
  dailyActiveUsers: { date: string; count: number }[];
  totalUsers: number;
  newUsersThisWeek: number;
  averageSessionTime: number;
  topPages: { page: string; views: number }[];
  userRetention: { period: string; percentage: number }[];
}

interface UserEngagementPanelProps {
  data: UserEngagementData;
}

export const UserEngagementPanel: React.FC<UserEngagementPanelProps> = ({ data }) => {
  const formatSessionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Active Users Chart */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usuários Ativos Diários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.dailyActiveUsers}>
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
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Métricas Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Novos usuários esta semana</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.newUsersThisWeek}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Tempo médio de sessão</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {formatSessionTime(data.averageSessionTime)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Páginas Mais Visitadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">#{index + 1}</span>
                  <span className="text-white font-medium">{page.page}</span>
                </div>
                <span className="text-blue-400 font-semibold">
                  {page.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Retention */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Retenção de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.userRetention}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="period" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
