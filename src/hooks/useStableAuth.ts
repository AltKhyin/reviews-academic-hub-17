
// ABOUTME: Stable authentication hook with consistent auth state and optimized caching
import { useAuth } from '@/contexts/AuthContext';

export const useStableAuth = () => {
  const authData = useAuth();
  
  return {
    user: authData.user,
    profile: authData.profile,
    isAuthenticated: !!authData.user,
    isAdmin: authData.isAdmin,
    canEdit: authData.isAdmin,
    role: authData.profile?.role || 'user',
    isLoading: authData.isLoading,
    isReady: !authData.isLoading,
    permissions: {
      isAdmin: authData.isAdmin,
      canEdit: authData.isAdmin,
    },
    hasPermission: (permission: 'read' | 'write' | 'admin') => {
      switch (permission) {
        case 'read':
          return !!authData.user;
        case 'write':
        case 'admin':
          return authData.isAdmin;
        default:
          return false;
      }
    },
    refreshAuth: authData.refreshProfile,
  };
};
