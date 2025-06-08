
// ABOUTME: Analytics playground chart renderer with actual Recharts implementation
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

interface PlaygroundChart {
  id: string;
  name: string;
  xAxis: string;
  yAxis: string;
  chartType: 'line' | 'bar' | 'area' | 'pie';
  events: string[];
}

interface ChartRendererProps {
  chart: PlaygroundChart | null;
  analyticsData: any;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ chart, analyticsData }) => {
  if (!chart) {
    return (
      <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }} className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 className="text-lg font-medium mb-2">Selecione um Gráfico</h3>
            <p className="text-sm">Crie um novo gráfico ou selecione um existente na barra lateral</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate mock data based on chart configuration
  const generateChartData = () => {
    if (!analyticsData) {
      return [];
    }

    switch (chart.xAxis) {
      case 'date':
        return generateDateBasedData();
      case 'user_type':
        return generateUserTypeData();
      case 'content_type':
        return generateContentTypeData();
      case 'category':
        return generateCategoryData();
      default:
        return [];
    }
  };

  const generateDateBasedData = () => {
    // Use actual activity trend data if available
    if (analyticsData.communityActivity?.activityTrend) {
      return analyticsData.communityActivity.activityTrend.map(item => ({
        name: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        value: chart.yAxis === 'count' ? item.posts + item.comments : 
               chart.yAxis === 'percentage' ? Math.round((item.posts / (item.posts + item.comments)) * 100) :
               chart.yAxis === 'average' ? Math.round((item.posts + item.comments) / 2) :
               item.posts + item.comments,
        posts: item.posts,
        comments: item.comments,
        votes: item.votes
      }));
    }

    // Fallback to generated data
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        name: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 100) + 20,
        posts: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 80) + 15,
        votes: Math.floor(Math.random() * 200) + 50
      });
    }
    return dates;
  };

  const generateUserTypeData = () => {
    return [
      { name: 'Usuários', value: analyticsData.userEngagement?.totalUsers || 125 },
      { name: 'Administradores', value: 8 },
      { name: 'Editores', value: 15 },
      { name: 'Moderadores', value: 12 }
    ];
  };

  const generateContentTypeData = () => {
    return [
      { name: 'Issues', value: analyticsData.contentMetrics?.publishedIssues || 45 },
      { name: 'Posts', value: analyticsData.communityActivity?.totalPosts || 156 },
      { name: 'Comentários', value: analyticsData.communityActivity?.totalComments || 234 },
      { name: 'Polls', value: 12 }
    ];
  };

  const generateCategoryData = () => {
    if (analyticsData.contentMetrics?.issuesBySpecialty) {
      return analyticsData.contentMetrics.issuesBySpecialty.map(item => ({
        name: item.specialty,
        value: item.count
      }));
    }

    return [
      { name: 'Cardiologia', value: 28 },
      { name: 'Neurologia', value: 22 },
      { name: 'Oncologia', value: 18 },
      { name: 'Pediatria', value: 15 },
      { name: 'Cirurgia', value: 12 }
    ];
  };

  const data = generateChartData();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  const renderChart = () => {
    switch (chart.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              {chart.events.includes('posts') && (
                <Line type="monotone" dataKey="posts" stroke="#10b981" strokeWidth={2} />
              )}
              {chart.events.includes('comments') && (
                <Line type="monotone" dataKey="comments" stroke="#f59e0b" strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }} className="h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {chart.name}
          <div className="text-sm text-gray-400 font-normal">
            {chart.chartType.charAt(0).toUpperCase() + chart.chartType.slice(1)} Chart
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)]">
        {renderChart()}
      </CardContent>
    </Card>
  );
};
