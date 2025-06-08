
// ABOUTME: Updated Edit page with enhanced analytics dashboard
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarConfigPanel } from '@/components/admin/SidebarConfigPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { IssuesManagementPanel } from '@/components/admin/IssuesManagementPanel';
import { CommentReportsPanel } from '@/components/dashboard/CommentReportsPanel';
import { TagManagementPanel } from '@/components/admin/TagManagementPanel';
import { EnhancedAnalyticsDashboard } from '@/components/analytics/EnhancedAnalyticsDashboard';
import { HomepageManager } from '@/components/admin/HomepageManager';
import { Settings, BarChart3, Users, MessageSquare, Crown, FileText, Edit, Tags, Home } from 'lucide-react';

const EditPage = () => {
  const { isAdmin, isEditor, isLoading, user, profile } = useAuth();

  console.log("Edit page render - IsAdmin:", isAdmin, "IsEditor:", isEditor, "IsLoading:", isLoading, "User:", user?.id, "Profile:", profile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const hasAdminAccess = isAdmin || profile?.role === 'admin';
  const hasEditorAccess = isEditor || profile?.role === 'editor' || hasAdminAccess;

  console.log("Access check - HasAdminAccess:", hasAdminAccess, "HasEditorAccess:", hasEditorAccess);

  if (!hasAdminAccess && !hasEditorAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#121212' }}>
        <Card className="w-96" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <CardHeader>
            <CardTitle className="text-center text-white">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-400">
              Você não tem permissão para acessar esta página.
            </p>
            <div className="mt-4 text-xs text-center text-gray-400">
              Esta página requer privilégios de administrador ou editor.
            </div>
            <div className="mt-2 text-xs text-center text-gray-500">
              Debug: IsAdmin={isAdmin ? 'true' : 'false'}, IsEditor={isEditor ? 'true' : 'false'}, Role={profile?.role || 'none'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
          <Crown className="w-8 h-8 text-yellow-500" />
          Painel {hasAdminAccess ? 'Administrativo' : 'Editorial'}
        </h1>
        <p className="text-gray-400 mt-2">
          Gerencie configurações do sistema, usuários e conteúdo
        </p>
        {hasAdminAccess && (
          <div className="mt-2 text-sm text-green-400">
            ✅ Acesso de administrador confirmado
          </div>
        )}
      </div>
      
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-8" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="homepage" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Homepage
          </TabsTrigger>
          {hasAdminAccess && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Usuários
            </TabsTrigger>
          )}
          <TabsTrigger value="sidebar" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Barra Lateral
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Denúncias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sistema
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="issues">
          <IssuesManagementPanel />
        </TabsContent>
        
        <TabsContent value="tags">
          <TagManagementPanel />
        </TabsContent>
        
        <TabsContent value="homepage">
          <HomepageManager />
        </TabsContent>
        
        {hasAdminAccess && (
          <TabsContent value="users">
            <UserManagementPanel />
          </TabsContent>
        )}
        
        <TabsContent value="sidebar">
          <SidebarConfigPanel />
        </TabsContent>
        
        <TabsContent value="reports">
          <CommentReportsPanel />
        </TabsContent>
        
        <TabsContent value="analytics">
          <EnhancedAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="system">
          <Card style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <CardHeader>
              <CardTitle className="text-white">Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Configurações avançadas do sistema em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditPage;
