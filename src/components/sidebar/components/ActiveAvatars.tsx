
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSidebarStore } from '@/stores/sidebarStore';

export const ActiveAvatars: React.FC = () => {
  const { onlineUsers, stats, isLoadingUsers, isLoadingStats } = useSidebarStore();

  if (isLoadingUsers || isLoadingStats) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="flex space-x-[-8px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-7 h-7 bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="h-3 bg-gray-700 rounded w-20 animate-pulse" />
      </div>
    );
  }

  if (!onlineUsers?.length) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Usuários Ativos</h3>
        <p className="text-xs text-gray-500">Nenhum usuário online no momento</p>
        <p className="text-xs text-gray-400">{stats?.totalUsers || 0} inscritos</p>
      </div>
    );
  }

  // Show max 6 users in avatar strip
  const displayUsers = onlineUsers.slice(0, 6);
  const remainingCount = Math.max(0, onlineUsers.length - 6);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Usuários Ativos</h3>
      
      {/* Avatar Strip */}
      <div className="flex items-center space-x-[-8px]">
        {displayUsers.map((user, index) => {
          const timeAgo = formatDistanceToNow(new Date(user.last_active), {
            addSuffix: true,
            locale: ptBR
          });

          return (
            <div
              key={user.id}
              className="relative group"
              title={`${user.full_name || 'Usuário'} - visto ${timeAgo}`}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-800 shadow-sm">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Usuário'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                    {(user.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Green dot for top 3 users */}
              {index < 3 && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              )}
            </div>
          );
        })}
        
        {/* +N bubble for remaining users */}
        {remainingCount > 0 && (
          <div 
            className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center"
            title={`Mais ${remainingCount} usuários online`}
          >
            <span className="text-xs font-medium text-gray-300">+{remainingCount}</span>
          </div>
        )}
      </div>
      
      {/* Stats line */}
      <div className="text-xs text-gray-400">
        {stats?.onlineUsers || 0} online • {stats?.totalUsers || 0} inscritos
      </div>
    </div>
  );
};
