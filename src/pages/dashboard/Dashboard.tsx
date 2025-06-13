
// ABOUTME: Enhanced dashboard with proper error handling and data validation
// Main dashboard page with comprehensive null safety

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useSharedData } from '@/contexts/SharedDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { sectionVisibility, isLoading: sharedDataLoading } = useSharedData();

  // Fetch recent issues with proper error handling
  const { data: issues = [], isLoading, error } = useQuery({
    queryKey: ['dashboard-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as Issue[];
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stats with error handling
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [issuesCount, usersCount] = await Promise.all([
        supabase.from('issues').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalIssues: issuesCount.count || 0,
        totalUsers: usersCount.count || 0,
        publishedIssues: issues?.length || 0
      };
    },
    enabled: !!issues, // Only run after issues are loaded
  });

  if (sharedDataLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erro ao carregar dashboard</p>
          <p className="text-gray-600 text-sm">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  // Safe array operations with fallbacks
  const safeIssues = Array.isArray(issues) ? issues : [];
  const featuredIssues = safeIssues.filter(issue => issue.featured) || [];
  const recentIssues = safeIssues.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Gerencie suas revisões e conteúdo</p>
        </div>
        <Link to="/dashboard/issues/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Revisão
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {sectionVisibility?.stats !== false && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Revisões</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalIssues || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.publishedIssues || 0} publicadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                usuários registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Featured Issues */}
      {sectionVisibility?.featured !== false && featuredIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisões em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featuredIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{issue.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{issue.specialty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Destaque</Badge>
                    <Link to={`/issues/${issue.id}`}>
                      <Button variant="outline" size="sm">Ver</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Issues */}
      {sectionVisibility?.recent !== false && (
        <Card>
          <CardHeader>
            <CardTitle>Revisões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentIssues.length > 0 ? (
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{issue.specialty}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(issue.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.published && <Badge variant="default">Publicado</Badge>}
                      <Link to={`/dashboard/issues/${issue.id}`}>
                        <Button variant="outline" size="sm">Editar</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Nenhuma revisão encontrada</p>
                <Link to="/dashboard/issues/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Revisão
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
