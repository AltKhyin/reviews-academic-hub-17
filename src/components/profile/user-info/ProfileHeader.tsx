
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, BookOpen, MessageSquare, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserStatsBadge } from '../user-stats/UserStatsBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSocialUrl } from '@/lib/utils';
import { Linkedin, Youtube, Instagram, X, Mail, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
  user: any;
  profile: any;
  stats: {
    articlesRead: number;
    communityContributions: number;
  };
  onEditProfile: () => void;
  onAvatarUpdate: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploading: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user,
  profile,
  stats,
  onEditProfile,
  onAvatarUpdate,
  uploading
}) => {
  // Define se temos algum perfil de rede social preenchido - verificando com operador opcional
  const hasSocialMedia = !!(profile?.linkedin || profile?.youtube || profile?.instagram || profile?.twitter);

  const createdAt = user?.created_at 
    ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'Data não disponível';

  return (
    <div className="p-5">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar - Lado esquerdo */}
        <div className="flex-shrink-0 relative self-center md:self-start">
          <div className="relative group">
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={onAvatarUpdate}
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
        
        {/* Conteúdo central e direito - realinhados para ficarem no mesmo nível horizontal */}
        <div className="flex flex-1 flex-row items-center">
          {/* Nome e Profissão - Parte central */}
          <div className="flex-1">
            <div>
              <h1 className="font-serif text-3xl font-medium mb-1 text-center md:text-left">
                {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
              </h1>
              <p className="text-gray-400 text-base text-center md:text-left">
                {profile?.specialty ? 'Profissão: ' + profile.specialty : 'Profissão não definida'}
              </p>
            </div>
          </div>
          
          {/* Caixas de estatísticas - Realinhadas à direita como badges */}
          <div className="hidden md:flex gap-4 justify-end items-center">
            <UserStatsBadge 
              icon={<BookOpen className="w-4 h-4 text-gray-400" />}
              count={stats.articlesRead}
              label="artigos lidos"
            />
            
            <UserStatsBadge 
              icon={<MessageSquare className="w-4 h-4 text-gray-400" />}
              count={stats.communityContributions}
              label="contribuições"
            />
            
            <Button
              onClick={onEditProfile}
              variant="outline"
              className="bg-[#212121]/80 text-gray-400 hover:text-white border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors px-4 py-3 rounded-md min-w-[60px] h-auto"
            >
              <div className="flex flex-col items-center justify-center">
                <Edit className="w-4 h-4" />
                <span className="text-xs text-gray-400 mt-1">editar</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Caixas de estatísticas para mobile - Visíveis apenas em telas pequenas */}
      <div className="flex md:hidden gap-4 justify-center mt-4">
        <UserStatsBadge 
          icon={<BookOpen className="w-4 h-4 text-gray-400" />}
          count={stats.articlesRead}
          label="artigos lidos"
        />
        
        <UserStatsBadge 
          icon={<MessageSquare className="w-4 h-4 text-gray-400" />}
          count={stats.communityContributions}
          label="contribuições"
        />
        
        <Button
          onClick={onEditProfile}
          variant="outline"
          className="bg-[#212121]/80 text-gray-400 hover:text-white border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors px-4 py-3 rounded-md min-w-[60px] h-auto"
        >
          <div className="flex flex-col items-center justify-center">
            <Edit className="w-4 h-4" />
            <span className="text-xs text-gray-400 mt-1">editar</span>
          </div>
        </Button>
      </div>
      
      {/* Bloco de informações adicionais */}
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
    </div>
  );
};
