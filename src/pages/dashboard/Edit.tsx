
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarConfigPanel } from '@/components/admin/SidebarConfigPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { Settings, BarChart3, Users, MessageSquare, Crown } from 'lucide-react';

const Edit = () => {
  const { isAdmin, isLoading } = useAuth();

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

  if (!isAdmin) {
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
              Esta página requer privilégios de administrador.
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
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie configurações do sistema, usuários e conteúdo
        </p>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Barra Lateral
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sistema
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>
        
        <TabsContent value="sidebar">
          <SidebarConfigPanel />
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
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de gerenciamento de conteúdo em desenvolvimento...</p>
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

export default Edit;
