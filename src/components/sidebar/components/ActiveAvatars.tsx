
// ABOUTME: Fixed active users avatar strip with proper avatar URLs and error handling
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
            // Fixed avatar URL resolution with proper fallback chain
            let avatarUrl: string | undefined;
            let displayName = 'Usuário';
            let userInitial = 'U';

            // Get display name and initial from available properties
            if (user.full_name) {
              displayName = user.full_name;
              userInitial = displayName[0].toUpperCase();
            } else {
              // Use user ID as fallback for display name
              displayName = `Usuário ${user.id.slice(0, 8)}`;
              userInitial = 'U';
            }

            // Try to get avatar URL from user data
            if (user.avatar_url) {
              avatarUrl = user.avatar_url;
            }

            // Generate fallback URL if no avatar found
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6b7280&color=fff&size=32&format=svg`;
            
            return (
              <div key={user.id || index} className="relative group">
                <div className="w-7 h-7 rounded-full border-2 border-gray-800 shadow-sm transition-transform group-hover:scale-110 group-hover:z-10 overflow-hidden bg-gray-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Avatar failed to load, using fallback:', avatarUrl);
                        const img = e.target as HTMLImageElement;
                        img.src = fallbackUrl;
                      }}
                      onLoad={() => {
                        console.log('Avatar loaded successfully:', avatarUrl);
                      }}
                    />
                  ) : (
                    <img
                      src={fallbackUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Fallback avatar failed, showing initials');
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        // Show initials as backup
                        const container = img.parentElement;
                        if (container) {
                          container.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-medium text-white bg-gray-600">${userInitial}</div>`;
                        }
                      }}
                    />
                  )}
                </div>
                
                {/* Online indicator for first 3 users */}
                {index < 3 && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-green-400 fill-green-400" />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {displayName}
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
