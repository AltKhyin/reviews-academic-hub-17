
// ABOUTME: Community activity analytics panel for posts, comments, and engagement
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MessageSquare, Users, TrendingUp, Award } from 'lucide-react';

interface CommunityActivityData {
  totalPosts: number;
  totalComments: number;
  activeDiscussions: number;
  topContributors: { name: string; contributions: number }[];
  postsThisWeek: { date: string; count: number }[];
  commentsThisWeek: { date: string; count: number }[];
}

interface CommunityActivityPanelProps {
  data: CommunityActivityData;
}

export const CommunityActivityPanel: React.FC<CommunityActivityPanelProps> = ({ data }) => {
  // Combine posts and comments data for comparison
  const combinedWeeklyData = data.postsThisWeek.map((post, index) => ({
    date: post.date,
    posts: post.count,
    comments: data.commentsThisWeek[index]?.count || 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Overview */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Atividade da Comunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Total de Posts</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.totalPosts.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Total de Comentários</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.totalComments.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Discussões Ativas</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {data.activeDiscussions}
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Comentários por Post</span>
              <span className="text-lg font-semibold text-blue-400">
                {data.totalPosts > 0 ? 
                  (data.totalComments / data.totalPosts).toFixed(1) 
                  : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
        <CardHeader>
          <CardTitle className="text-white">Atividade Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={combinedWeeklyData}>
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
              <Bar dataKey="posts" fill="#3b82f6" name="Posts" radius={[2, 2, 0, 0]} />
              <Bar dataKey="comments" fill="#10b981" name="Comentários" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }} className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Contribuidores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{contributor.name}</p>
                  <p className="text-gray-400 text-sm">
                    {contributor.contributions} contribuições
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
