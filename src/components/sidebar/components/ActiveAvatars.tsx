
// ABOUTME: Fixed avatar display with proper fallbacks and error handling
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OnlineUser } from '@/types/sidebar';

interface ActiveAvatarsProps {
  users: OnlineUser[];
  maxDisplay?: number;
}

export const ActiveAvatars: React.FC<ActiveAvatarsProps> = ({ 
  users, 
  maxDisplay = 8 
}) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-2">
        Nenhum usuário online no momento
      </div>
    );
  }

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {displayUsers.map((user) => {
          // Fixed: Proper fallback logic for avatar and name
          const displayName = user.full_name || 'Usuário';
          const avatarUrl = user.avatar_url;
          const initials = displayName.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div key={user.id} className="flex items-center group">
              <Avatar className="w-8 h-8 border-2 border-gray-600 hover:border-gray-400 transition-colors">
                <AvatarImage 
                  src={avatarUrl || undefined} 
                  alt={displayName}
                  onError={(e) => {
                    // Handle image load errors gracefully
                    console.warn(`Failed to load avatar for user: ${displayName}`);
                  }}
                />
                <AvatarFallback className="bg-gray-600 text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Tooltip on hover */}
              <div className="absolute z-10 hidden group-hover:block ml-10 -mt-2">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-600">
                  {displayName}
                </div>
              </div>
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-500">
            <span className="text-xs font-medium text-white">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-400">
        {users.length} usuário{users.length !== 1 ? 's' : ''} online
      </div>
    </div>
  );
};
