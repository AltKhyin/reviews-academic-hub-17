
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { useCommunitySettings } from '@/hooks/useCommunityPosts';
import { Button } from '@/components/ui/button';
import { Pencil, Image, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const CommunityHeader: React.FC = () => {
  const { user } = useAuth();
  const { data: settings, isLoading, refetch } = useCommunitySettings();
  const [isEditing, setIsEditing] = useState(false);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Check if user is an admin
  React.useEffect(() => {
    if (!user) return;
    
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      setIsAdmin(!!data);
    };
    
    checkAdminStatus();
  }, [user]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setHeaderImagePreview(objectUrl);
    }
  };
  
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      let imageUrl = settings.header_image_url;
      
      if (headerImageFile) {
        console.log("Uploading header image file...", headerImageFile.name);
        const uploadedUrl = await uploadFile(headerImageFile, 'community');
        if (uploadedUrl) {
          console.log("Upload successful, URL:", uploadedUrl);
          imageUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }
      
      console.log("Updating community settings with new header:", imageUrl);
      
      // Use fetch API directly for consistency with the hook
      const response = await fetch(
        `https://kznasfgubbyinomtetiu.supabase.co/rest/v1/community_settings?id=eq.${settings.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apiKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bmFzZmd1YmJ5aW5vbXRldGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2Njg4NzMsImV4cCI6MjA2MTI0NDg3M30.Fx7xl_EA_G8SVVjWyVRu61kWhwkrbFlZsulQz_WKx7Q',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
          },
          body: JSON.stringify({ header_image_url: imageUrl })
        }
      );
      
      if (!response.ok) {
        console.error("Error response:", await response.text());
        throw new Error(`Error updating settings: ${response.statusText}`);
      }
      
      await refetch();
      setIsEditing(false);
      setHeaderImageFile(null);
      setHeaderImagePreview(null);
      
      toast({
        title: "Configurações atualizadas",
        description: "As configurações da comunidade foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error updating community settings:', error);
      toast({
        title: "Erro ao atualizar configurações",
        description: error.message || "Ocorreu um erro ao atualizar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-48 rounded-md" />
      </div>
    );
  }
  
  if (!settings) {
    return null;
  }
  
  return (
    <>
      <div 
        className="relative w-full h-48 bg-cover bg-center rounded-md mb-6 overflow-hidden"
        style={{ backgroundImage: `url(${settings.header_image_url})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-4xl font-serif text-white font-semibold drop-shadow-lg">Comunidade</h1>
        </div>
        
        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cabeçalho da Comunidade</DialogTitle>
            <DialogDescription>
              Personalize a aparência da página da comunidade.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header-image">Imagem de Cabeçalho</Label>
              <div className="border rounded-md p-2 flex flex-col items-center justify-center space-y-2">
                <div 
                  className="w-full h-32 rounded bg-cover bg-center mb-2"
                  style={{ 
                    backgroundImage: `url(${headerImagePreview || settings.header_image_url})` 
                  }}
                ></div>
                
                <Label 
                  htmlFor="header-image-upload"
                  className="cursor-pointer flex items-center px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </Label>
                <Input
                  id="header-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {headerImageFile && (
                  <p className="text-sm text-green-500">
                    Imagem selecionada: {headerImageFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setHeaderImageFile(null);
                  setHeaderImagePreview(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isUploading || isSaving}
              >
                {(isUploading || isSaving) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
