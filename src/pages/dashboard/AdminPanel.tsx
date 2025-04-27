
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { profile } = useAuth();
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';

  if (!isEditorOrAdmin) {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Painel do Administrador</h1>
      
      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Gerenciar Seções</TabsTrigger>
          <TabsTrigger value="comments">Comentários do Revisor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections">
          <Card className="border-white/10 bg-white/5">
            <HomepageSectionsManager 
              sections={[]} 
              updateSections={() => {}}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="comments">
          <ReviewerCommentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
