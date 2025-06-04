
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSidebarStore } from '@/stores/sidebarStore';

export const ActiveAvatars: React.FC = () => {
  const { onlineUsers, isLoadingUsers } = useSidebarStore();

  if (isLoadingUsers) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!onlineUsers?.length) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Usuários Ativos</h3>
        <p className="text-xs text-gray-500">Nenhum usuário online no momento</p>
      </div>
    );
  }

  // Show max 7 users as per requirement
  const displayUsers = onlineUsers.slice(0, 7);
  const remainingCount = Math.max(0, onlineUsers.length - 7);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-300">Usuários Ativos</h3>
      
      <div className="flex items-center space-x-1">
        {displayUsers.map((user, index) => {
          // Top 3 users at 100% opacity, next 4 at 60%
          const opacity = index < 3 ? 'opacity-100' : 'opacity-60';
          const timeAgo = formatDistanceToNow(new Date(user.last_active), {
            addSuffix: true,
            locale: ptBR
          });

          return (
            <div
              key={user.id}
              className={`relative group ${opacity}`}
              title={`${user.full_name || 'Usuário'} - visto ${timeAgo}`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600 transition-opacity">
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
            className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center opacity-60"
            title={`Mais ${remainingCount} usuários online`}
          >
            <span className="text-xs font-medium text-gray-300">+{remainingCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};
