
// ABOUTME: User profile page with profile header, activity, and saved content tabs
// Now uses proper responsive containers without arbitrary width constraints

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { ProfileActivity } from '@/components/profile/ProfileActivity';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { ProfileHeader } from '@/components/profile/user-info/ProfileHeader';
import { SavedContentTabs } from '@/components/profile/saved-content/SavedContentTabs';
import { useUserStats } from '@/components/profile/user-stats/useUserStats';

const Profile: React.FC = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const stats = useUserStats(user?.id);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !user) {
      return;
    }
    
    try {
      setUploading(true);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Verifica se o bucket existe antes do upload
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!bucketExists) {
        console.error('Bucket "avatars" não encontrado');
        try {
          // Tenta criar o bucket se não existir
          await supabase.storage.createBucket('avatars', { public: true });
          console.log('Bucket avatars criado');
        } catch (bucketError) {
          console.error('Falha ao criar bucket:', bucketError);
          throw new Error('Armazenamento não disponível. Por favor, contate o suporte.');
        }
      }
      
      // Upload para o Storage do Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Obtém a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Atualiza o perfil do usuário
      await updateProfile({ avatar_url: publicUrl });
      await refreshProfile();
      
      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso!",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload do avatar",
        variant: "destructive",
        duration: 5000,
      });
      console.error('Erro ao fazer upload do avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
        {/* Card de perfil */}
        <Card className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden shadow-md">
          <ProfileHeader 
            user={user}
            profile={profile}
            stats={stats}
            onEditProfile={() => setEditProfileOpen(true)}
            onAvatarUpdate={handleAvatarUpload}
            uploading={uploading}
          />
        </Card>
        
        {/* Container 2: Atividade Recente */}
        <ProfileActivity className="" userId={user?.id} />
        
        {/* Container 3 e 4: Reviews Favoritas e Posts Salvos (Tabs) */}
        <SavedContentTabs userId={user?.id} />
        
        {/* Dialog de edição de perfil */}
        <EditProfileDialog 
          open={editProfileOpen} 
          onOpenChange={setEditProfileOpen} 
          profile={profile}
          onProfileUpdated={refreshProfile}
        />
      </div>
    </div>
  );
};

export default Profile;
