
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const EditApp = () => {
  const { profile, isLoading } = useAuth();
  const [sections, setSections] = useState([
    { id: 'reviewer', title: 'Nota do Revisor', visible: true, order: 0 },
    { id: 'featured', title: 'Destaque', visible: true, order: 1 },
    { id: 'recent', title: 'Edições Recentes', visible: true, order: 2 },
    { id: 'upcoming', title: 'Próxima Edição', visible: true, order: 3 },
    { id: 'recommended', title: 'Recomendados para você', visible: true, order: 4 },
    { id: 'trending', title: 'Mais acessados', visible: true, order: 5 }
  ]);

  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';

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

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!isEditorOrAdmin) {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar Aplicativo</h1>
      
      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Seções da Página Inicial</TabsTrigger>
          <TabsTrigger value="reviewer">Notas do Revisor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections">
          <HomepageSectionsManager 
            sections={sections}
            updateSections={updateSections}
          />
        </TabsContent>
        
        <TabsContent value="reviewer">
          <ReviewerCommentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditApp;
