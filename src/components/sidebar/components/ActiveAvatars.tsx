
// ABOUTME: Fixed active users avatar strip with proper avatar URLs and improved loading
import React from 'react';
import { Users, Circle } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const ActiveAvatars: React.FC = () => {
  const { onlineUsers, stats, isLoadingUsers, isLoadingStats } = useSidebarStore();

  if (isLoadingUsers || isLoadingStats) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="flex items-center space-x-[-8px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-7 h-7 bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const displayUsers = onlineUsers.slice(0, 6);
  const overflowCount = Math.max(0, onlineUsers.length - 6);
  const totalOnline = stats?.onlineUsers || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-green-400" />
        <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Atividade Recente</h3>
      </div>
      
      <div className="space-y-3">
        {/* Avatar Strip */}
        <div className="flex items-center space-x-[-8px]">
          {displayUsers.map((user, index) => {
            // Fix: Get avatar URL from proper field with fallbacks
            const avatarUrl = user.avatar_url || user.profiles?.avatar_url;
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=6b7280&color=fff&size=32`;
            
            return (
              <div key={user.id} className="relative group">
                <img
                  src={avatarUrl || fallbackUrl}
                  alt={user.full_name || 'Usuário'}
                  className="w-7 h-7 rounded-full border-2 border-gray-800 shadow-sm transition-transform group-hover:scale-110 group-hover:z-10"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== fallbackUrl) {
                      console.log('Avatar failed to load, using fallback:', img.src);
                      img.src = fallbackUrl;
                    }
                  }}
                />
                
                {/* Online indicator for first 3 users */}
                {index < 3 && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-green-400 fill-green-400" />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {user.full_name || 'Usuário'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            );
          })}
          
          {/* Overflow indicator */}
          {overflowCount > 0 && (
            <div className="w-7 h-7 flex items-center justify-center text-xs bg-gray-700 text-gray-300 rounded-full border-2 border-gray-800 font-medium">
              +{overflowCount}
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Circle className="w-2 h-2 text-green-400 fill-green-400" />
            <span>{totalOnline} online agora</span>
          </div>
        </div>
      </div>
    </div>
  );
};
