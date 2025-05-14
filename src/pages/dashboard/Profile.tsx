
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
  User
} from 'lucide-react';
import { ProfileActivity } from '@/components/profile/ProfileActivity';
import { ProfileSavedItems } from '@/components/profile/ProfileSavedItems';

const Profile: React.FC = () => {
  const { state } = useSidebar();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const isCollapsed = state === 'collapsed';
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    articlesRead: 0,
    communityContributions: 0
  });

  useEffect(() => {
    // Carrega estatísticas do usuário quando disponíveis
    // Futuramente será substituído por chamadas reais à API
    const loadUserStats = async () => {
      if (!user) return;
      
      try {
        // Exemplo de consulta para contar artigos lidos (implementação futura)
        const { count: articlesRead, error: readError } = await supabase
          .from('user_article_views')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Exemplo de consulta para contar contribuições (implementação futura)
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
    <div className={`animate-fade-in pb-12 transition-all duration-300 ${isCollapsed ? 'max-w-[95%]' : 'max-w-[85%]'} mx-auto`}>
      {/* Container 1: Informações do Perfil */}
      <Card className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
            {/* Avatar e Upload */}
            <div className="mb-6 md:mb-0">
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
                  <Avatar className="w-24 h-24 border-2 border-gray-700">
                    {profile?.avatar_url ? (
                      <AvatarImage 
                        src={profile.avatar_url} 
                        alt={profile?.full_name || "Avatar do usuário"} 
                        className="object-cover transition-opacity group-hover:opacity-70"
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-700 text-3xl text-gray-300 transition-opacity group-hover:opacity-70">
                        {profile?.full_name ? profile.full_name[0].toUpperCase() : <User />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-60 text-white text-xs px-3 py-2 rounded-md flex items-center">
                      <Upload className="w-3 h-3 mr-1" />
                      <span>{uploading ? 'Enviando...' : 'Alterar foto'}</span>
                    </div>
                  </div>
                </label>
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-status-green border-2 border-[#1a1a1a]"></div>
              </div>
            </div>
            
            {/* Informações Pessoais */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-serif text-2xl font-medium mb-1">{profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}</h1>
              <p className="text-gray-400 mb-4">{profile?.specialty || 'Especialidade não definida'}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user?.email || 'Email não disponível'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Membro desde {createdAt}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{stats.articlesRead} artigos lidos</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span>{stats.communityContributions} contribuições na comunidade</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
            <Button className="bg-white text-[#121212] hover:bg-gray-200">
              Editar perfil
            </Button>
            <Button variant="outline" className="border border-[#2a2a2a] hover:bg-[#2a2a2a]">
              Preferências
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Container 2: Atividade Recente */}
      <ProfileActivity className="mb-8" userId={user?.id} />
      
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
    </div>
  );
};

export default Profile;
