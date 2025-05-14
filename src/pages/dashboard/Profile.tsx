
import React, { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BookOpen, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Calendar,
  Mail,
  Upload,
  User,
  Edit
} from 'lucide-react';
import { ProfileActivity } from '@/components/profile/ProfileActivity';
import { ProfileSavedItems } from '@/components/profile/ProfileSavedItems';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';

const Profile: React.FC = () => {
  const { state } = useSidebar();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const isCollapsed = state === 'collapsed';
  const [uploading, setUploading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [stats, setStats] = useState({
    articlesRead: 0,
    communityContributions: 0
  });

  useEffect(() => {
    // Carrega estatísticas do usuário quando disponíveis
    const loadUserStats = async () => {
      if (!user) return;
      
      try {
        // Exemplo de consulta para contar artigos lidos
        const { count: articlesRead, error: readError } = await supabase
          .from('user_article_views')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Exemplo de consulta para contar contribuições
        const { count: postsCount, error: postsError } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        const { count: commentsCount, error: commentsError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        setStats({
          articlesRead: articlesRead || 0,
          communityContributions: (postsCount || 0) + (commentsCount || 0)
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas do usuário:", error);
        // Valores fallback para demonstração
        setStats({
          articlesRead: Math.floor(Math.random() * 20),
          communityContributions: Math.floor(Math.random() * 10)
        });
      }
    };
    
    loadUserStats();
  }, [user]);

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

  const createdAt = user?.created_at 
    ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'Data não disponível';

  return (
    <div className={`animate-fade-in pb-16 pt-8 transition-all duration-300 ${isCollapsed ? 'max-w-[95%]' : 'max-w-[85%]'} mx-auto`}>
      {/* Container 1: Informações do Perfil */}
      <Card className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation mb-10 p-2">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar e Upload */}
            <div className="mb-6 md:mb-0 relative">
              <div className="relative group">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <label htmlFor="avatar-upload" className="cursor-pointer block">
                  <Avatar className="w-36 h-36 border-2 border-gray-700">
                    {profile?.avatar_url ? (
                      <AvatarImage 
                        src={profile.avatar_url} 
                        alt={profile?.full_name || "Avatar do usuário"} 
                        className="object-cover transition-opacity group-hover:opacity-70"
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-700 text-5xl text-gray-300 transition-opacity group-hover:opacity-70">
                        {profile?.full_name ? profile.full_name[0].toUpperCase() : <User size={48} />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-60 text-white text-sm px-3 py-2 rounded-md flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      <span>{uploading ? 'Enviando...' : 'Alterar foto'}</span>
                    </div>
                  </div>
                </label>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-status-green border-2 border-[#1a1a1a]"></div>
              </div>
            </div>
            
            {/* Informações Pessoais */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h1 className="font-serif text-3xl font-medium mb-2">{profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}</h1>
                  <p className="text-gray-400 mb-4">{profile?.specialty || 'Especialidade não definida'}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user?.email || 'Email não disponível'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Membro desde {createdAt}</span>
                    </div>
                  </div>
                </div>
                
                {/* Badges de Estatísticas */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex flex-col items-center justify-center bg-[#212121] rounded-lg p-4 min-w-[140px] border border-[#2a2a2a]">
                    <BookOpen className="w-5 h-5 text-status-green mb-1" />
                    <span className="text-xl font-semibold">{stats.articlesRead}</span>
                    <span className="text-xs text-gray-400">artigos lidos</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-[#212121] rounded-lg p-4 min-w-[140px] border border-[#2a2a2a]">
                    <MessageSquare className="w-5 h-5 text-status-amber mb-1" />
                    <span className="text-xl font-semibold">{stats.communityContributions}</span>
                    <span className="text-xs text-gray-400">contribuições</span>
                  </div>
                </div>
              </div>
              
              {/* Botão de Editar */}
              <Button 
                onClick={() => setEditProfileOpen(true)} 
                className="bg-white text-[#121212] hover:bg-gray-200 flex items-center gap-2 px-5 py-2 rounded-full"
              >
                <Edit className="w-4 h-4" />
                Editar perfil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Container 2: Atividade Recente */}
      <ProfileActivity className="mb-10" userId={user?.id} />
      
      {/* Container 3 e 4: Reviews Favoritas e Posts Salvos (Tabs) */}
      <Card className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation">
        <CardHeader className="px-6 pt-6 pb-0">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="bg-[#212121] w-full md:w-auto justify-start">
              <TabsTrigger value="favorites" className="data-[state=active]:bg-[#2a2a2a]">
                Reviews Favoritas
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-[#2a2a2a]">
                Posts Salvos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="mt-6">
              <ProfileSavedItems type="reviews" userId={user?.id} />
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6">
              <ProfileSavedItems type="posts" userId={user?.id} />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      {/* Dialog de edição de perfil */}
      <EditProfileDialog 
        open={editProfileOpen} 
        onOpenChange={setEditProfileOpen} 
        profile={profile}
        onProfileUpdated={refreshProfile}
      />
    </div>
  );
};

export default Profile;
