
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const { profile, isAdmin, isLoading } = useAuth();
  const [sections, setSections] = useState([
    { id: 'reviewer', title: 'Nota do Revisor', visible: true, order: 0 },
    { id: 'featured', title: 'Destaque', visible: true, order: 1 },
    { id: 'recent', title: 'Edições Recentes', visible: true, order: 2 },
    { id: 'upcoming', title: 'Próxima Edição', visible: true, order: 3 },
    { id: 'recommended', title: 'Recomendados para você', visible: true, order: 4 },
    { id: 'trending', title: 'Mais acessados', visible: true, order: 5 }
  ]);

  // For debugging purposes
  useEffect(() => {
    console.log("AdminPanel - Current user profile:", profile);
    console.log("AdminPanel - Is admin:", isAdmin);
  }, [profile, isAdmin]);

  const updateSections = (updatedSections) => {
    setSections(updatedSections);
    toast({
      title: "Seções atualizadas",
      description: "As alterações foram salvas com sucesso",
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Redirect if not authenticated
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin
  console.log("AdminPanel - Has access:", isAdmin);
  if (!isAdmin) {
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
              sections={sections}
              updateSections={updateSections}
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
