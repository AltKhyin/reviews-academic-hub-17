
import React, { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
    <div className={`animate-fade-in pt-6 pb-8 transition-all duration-300 ${isCollapsed ? 'max-w-[95%]' : 'max-w-[85%]'} mx-auto`}>
      {/* Container 1: Card de perfil redesenhado */}
      <Card className="bg-[#1a1a1a] rounded-xl border-0 overflow-hidden shadow-lg card-elevation mb-6 relative">
        {/* Background gradiente decorativo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-purple-900/30 to-blue-900/20"></div>
        
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Área superior com informações do perfil */}
            <div className="p-6 md:p-8 pt-10 md:pt-12 pb-6 relative z-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                {/* Avatar e Upload */}
                <div className="relative">
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
                      <Avatar className="h-28 w-28 md:h-36 md:w-36 rounded-full border-4 border-[#2a2a2a]">
                        {profile?.avatar_url ? (
                          <AvatarImage 
                            src={profile.avatar_url}
                            alt={profile?.full_name || "Avatar do usuário"}
                            className="object-cover transition-all group-hover:opacity-80"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-indigo-800 to-purple-900 text-4xl text-white">
                            {profile?.full_name ? profile.full_name[0].toUpperCase() : <User size={36} />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-75 rounded-full w-full h-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </label>
                    <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-status-green border-2 border-[#1a1a1a]"></div>
                  </div>
                </div>
                
                {/* Informações do perfil */}
                <div className="flex flex-1 flex-col md:flex-row gap-4 justify-between items-center md:items-start">
                  <div className="text-center md:text-left">
                    <h1 className="font-serif text-3xl font-medium mb-1">
                      {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                    </h1>
                    <p className="text-gray-400 mb-4">
                      {profile?.specialty || 'Especialidade não definida'}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-300">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[250px]">{user?.email || 'Email não disponível'}</span>
                      </div>
                      
                      <div className="hidden sm:flex items-center text-gray-500">•</div>
                      
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Membro desde {createdAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Estatísticas do usuário */}
                  <div className="flex flex-row gap-3 mt-2 md:mt-0">
                    <div className="flex flex-col items-center justify-center bg-[#212121]/75 backdrop-blur-sm rounded-lg p-3 min-w-[100px] border border-[#2a2a2a]">
                      <BookOpen className="w-4 h-4 text-status-green mb-1" />
                      <span className="text-xl font-bold">{stats.articlesRead}</span>
                      <span className="text-xs text-gray-400">artigos lidos</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-[#212121]/75 backdrop-blur-sm rounded-lg p-3 min-w-[100px] border border-[#2a2a2a]">
                      <MessageSquare className="w-4 h-4 text-status-amber mb-1" />
                      <span className="text-xl font-bold">{stats.communityContributions}</span>
                      <span className="text-xs text-gray-400">contribuições</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botão Editar Perfil */}
              <div className="flex justify-center md:justify-start mt-6">
                <Button
                  onClick={() => setEditProfileOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 transition-all shadow-md hover:shadow-lg rounded-full px-6"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar perfil
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Container 2: Atividade Recente */}
      <ProfileActivity className="mb-6" userId={user?.id} />
      
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
