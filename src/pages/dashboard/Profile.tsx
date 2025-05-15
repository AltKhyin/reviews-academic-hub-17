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
import { getSocialUrl } from '@/lib/utils';
import { 
  BookOpen, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Calendar,
  Mail,
  Upload,
  User,
  Edit,
  Linkedin,
  Youtube,
  Instagram,
  X
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

  // Define se temos algum perfil de rede social preenchido - verificando com operador opcional
  const hasSocialMedia = !!(profile?.linkedin || profile?.youtube || profile?.instagram || profile?.twitter);

  return (
    <div className={`animate-fade-in pt-4 pb-6 transition-all duration-300 ${isCollapsed ? 'max-w-[95%]' : 'max-w-[85%]'} mx-auto`}>
      {/* Card de perfil monocromático e clean */}
      <Card className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden shadow-md mb-2">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar - Aumentado */}
            <div className="flex-shrink-0 relative mt-2">
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
                  <Avatar className="h-36 w-36 md:h-40 md:w-40 rounded-full border-2 border-[#2a2a2a]">
                    {profile?.avatar_url ? (
                      <AvatarImage 
                        src={profile.avatar_url}
                        alt={profile?.full_name || "Avatar do usuário"}
                        className="object-cover transition-all group-hover:opacity-80"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-3xl text-white">
                        {profile?.full_name ? profile.full_name[0].toUpperCase() : <User size={42} />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-60 rounded-full w-full h-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </label>
                <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-500 border border-[#1a1a1a]"></div>
              </div>
            </div>
            
            {/* Informações do perfil reorganizadas */}
            <div className="flex flex-1 flex-col mt-2">
              <div className="mb-5">
                <h1 className="font-serif text-3xl font-medium mb-1 text-center md:text-left">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                </h1>
                <p className="text-gray-400 text-base text-center md:text-left">
                  {profile?.specialty ? 'Profissão: ' + profile.specialty : 'Profissão não definida'}
                </p>
              </div>
              
              {/* Badges de estatísticas - alinhadas horizontalmente */}
              <div className="flex flex-row gap-4 justify-center md:justify-start">
                <div className="flex flex-col items-center justify-center bg-[#212121]/80 rounded-md p-3 border border-[#2a2a2a] min-w-[100px]">
                  <BookOpen className="w-5 h-5 text-gray-400 mb-1" />
                  <div className="text-base font-medium">{stats.articlesRead}</div>
                  <div className="text-xs text-gray-400">artigos lidos</div>
                </div>
                
                <div className="flex flex-col items-center justify-center bg-[#212121]/80 rounded-md p-3 border border-[#2a2a2a] min-w-[100px]">
                  <MessageSquare className="w-5 h-5 text-gray-400 mb-1" />
                  <div className="text-base font-medium">{stats.communityContributions}</div>
                  <div className="text-xs text-gray-400">contribuições</div>
                </div>
                
                <Button
                  onClick={() => setEditProfileOpen(true)}
                  variant="outline"
                  className="bg-[#212121]/80 text-gray-400 hover:text-white border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors flex flex-col items-center justify-center p-3 rounded-md min-w-[100px] h-auto"
                >
                  <Edit className="w-5 h-5 mb-1" />
                  <div className="text-base font-medium"> </div>
                  <div className="text-xs text-gray-400">editar</div>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bloco de informações adicionais - movido para baixo */}
          <div className="pt-5 mt-4 border-t border-[#2a2a2a]">
            <div className="flex flex-col space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate max-w-[250px] text-sm">{user?.email || 'Email não disponível'}</span>
                  </div>
                  
                  <div className="hidden sm:flex items-center text-gray-500 px-1">•</div>
                  
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm">Membro desde {createdAt}</span>
                  </div>
                </div>
                
                {hasSocialMedia && (
                  <div className="flex gap-3 items-center pt-1">
                    {profile?.linkedin && (
                      <a 
                        href={getSocialUrl('linkedin', String(profile.linkedin))} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        title={`LinkedIn: ${profile.linkedin}`}
                      >
                        <Linkedin size={16} />
                      </a>
                    )}
                    
                    {profile?.youtube && (
                      <a 
                        href={getSocialUrl('youtube', String(profile.youtube))} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        title={`YouTube: ${profile.youtube}`}
                      >
                        <Youtube size={16} />
                      </a>
                    )}
                    
                    {profile?.instagram && (
                      <a 
                        href={getSocialUrl('instagram', String(profile.instagram))} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        title={`Instagram: ${profile.instagram}`}
                      >
                        <Instagram size={16} />
                      </a>
                    )}
                    
                    {profile?.twitter && (
                      <a 
                        href={getSocialUrl('twitter', String(profile.twitter))} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                        title={`X (Twitter): ${profile.twitter}`}
                      >
                        <X size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {profile?.bio && (
                <div className="py-1">
                  <p className="text-sm text-gray-300">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Container 2: Atividade Recente */}
      <ProfileActivity className="mb-2" userId={user?.id} />
      
      {/* Container 3 e 4: Reviews Favoritas e Posts Salvos (Tabs) */}
      <Card className="bg-[#1a1a1a] rounded-lg shadow-sm border border-[#2a2a2a]">
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
