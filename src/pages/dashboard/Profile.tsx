import React, { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

// Mock user profile data for demo sections
const mockData = {
  readArticles: 17,
  savedArticles: 8,
  recentActivity: [
    { type: 'read', title: 'Análise comparativa: novos anticoagulantes vs. warfarina', date: '18 out, 2023' },
    { type: 'saved', title: 'Meta-análise: eficácia de antidepressivos de nova geração', date: '15 out, 2023' },
    { type: 'read', title: 'Impactos do uso prolongado de inibidores de bomba de prótons', date: '12 out, 2023' },
  ]
};

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'read') {
    return <span className="bg-status-green w-2 h-2 rounded-full"></span>;
  } else if (type === 'saved') {
    return <span className="bg-status-amber w-2 h-2 rounded-full"></span>;
  }
  return null;
};

const Profile: React.FC = () => {
  const { state } = useSidebar();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { uploadAvatar, isUploading } = useFileUpload();
  const isCollapsed = state === 'collapsed';

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !user) {
      return;
    }
    
    try {
      const file = event.target.files[0];
      
      // Upload avatar using the uploadAvatar function
      const publicUrl = await uploadAvatar(file);
      
      if (!publicUrl) {
        throw new Error("Failed to get public URL for the uploaded avatar");
      }
      
      // Update user profile
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
      console.error('Error uploading avatar:', error);
    }
  };

  return (
    <div className={`animate-fade-in pb-12 transition-all duration-300 ${isCollapsed ? 'max-w-[95%]' : 'max-w-[85%]'} mx-auto`}>
      <div className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
          <div className="mb-4 md:mb-0">
            <div className="relative group">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile?.full_name || "User avatar"} 
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-70"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl text-gray-300 transition-opacity group-hover:opacity-70">
                      {profile?.full_name ? profile.full_name[0].toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {isUploading ? 'Enviando...' : 'Mudar foto'}
                  </span>
                </div>
              </label>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-status-green border-2 border-[#1a1a1a]"></div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif text-2xl font-medium mb-1">{profile?.full_name || user?.email || 'Usuário'}</h1>
            <p className="text-gray-400">{profile?.specialty || 'Especialidade não definida'}</p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p>{user?.email || 'Email não definido'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Instituição</p>
                <p>{profile?.institution || 'Instituição não definida'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Membro desde</p>
                <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-col items-center space-y-3">
            <div className="bg-[#212121] rounded-md p-3 w-full text-center">
              <p className="text-2xl font-medium">{mockData.readArticles}</p>
              <p className="text-xs text-gray-400">Artigos lidos</p>
            </div>
            <div className="bg-[#212121] rounded-md p-3 w-full text-center">
              <p className="text-2xl font-medium">{mockData.savedArticles}</p>
              <p className="text-xs text-gray-400">Artigos salvos</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
          <button className="bg-white text-[#121212] px-4 py-2 rounded-md hover:bg-gray-200 hover-effect">
            Editar perfil
          </button>
          <button className="border border-[#2a2a2a] px-4 py-2 rounded-md hover:bg-[#2a2a2a] hover-effect">
            Preferências
          </button>
        </div>
      </div>
      
      {/* Recent activity section */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-lg card-elevation p-6">
        <h2 className="font-serif text-xl font-medium mb-6">Atividade recente</h2>
        
        <div className="space-y-4">
          {mockData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 hover:bg-[#212121] rounded-md hover-effect">
              <div className="mt-1">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {activity.type === 'read' ? 'Lido em' : 'Salvo em'} {activity.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-400 hover:text-white hover-effect">
            Ver todas as atividades
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
