
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarConfigPanel } from '@/components/admin/SidebarConfigPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { IssuesManagementPanel } from '@/components/admin/IssuesManagementPanel';
import { CommentReportsPanel } from '@/components/dashboard/CommentReportsPanel';
import { ReviewerCommentsManager } from '@/components/admin/ReviewerCommentsManager';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { Settings, BarChart3, Users, MessageSquare, Crown, Layout, FileText, Edit } from 'lucide-react';

const EditPage = () => {
  const { isAdmin, isEditor, isLoading, user, profile } = useAuth();

  console.log("Edit page render - IsAdmin:", isAdmin, "IsEditor:", isEditor, "IsLoading:", isLoading, "User:", user?.id, "Profile:", profile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const hasAdminAccess = isAdmin || profile?.role === 'admin';
  const hasEditorAccess = isEditor || profile?.role === 'editor' || hasAdminAccess;

  console.log("Access check - HasAdminAccess:", hasAdminAccess, "HasEditorAccess:", hasEditorAccess);

  if (!hasAdminAccess && !hasEditorAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
            <div className="mt-4 text-xs text-center text-muted-foreground">
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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Painel {hasAdminAccess ? 'Administrativo' : 'Editorial'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie configurações do sistema, usuários e conteúdo
        </p>
        {hasAdminAccess && (
          <div className="mt-2 text-sm text-green-400">
            ✅ Acesso de administrador confirmado
          </div>
        )}
      </div>
      
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Seções
          </TabsTrigger>
          <TabsTrigger value="reviewer" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Notas do Revisor
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
        
        <TabsContent value="sections">
          <HomepageSectionsManager />
        </TabsContent>
        
        <TabsContent value="reviewer">
          <ReviewerCommentsManager />
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
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de analytics em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações avançadas do sistema em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditPage;
