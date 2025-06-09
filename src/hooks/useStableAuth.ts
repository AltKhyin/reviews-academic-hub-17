
// ABOUTME: Stable authentication hook with consistent auth state and optimized caching
import { useOptimizedAuth } from './useOptimizedAuth';

export const useStableAuth = () => {
  const authData = useOptimizedAuth();
  
  return {
    user: authData.user,
    profile: authData.profile,
    isAuthenticated: authData.isAuthenticated,
    isAdmin: authData.isAdmin,
    isEditor: authData.isEditor,
    canEdit: authData.canEdit,
    role: authData.role,
    isLoading: authData.isLoading,
    isReady: !authData.isLoading,
    permissions: {
      isAdmin: authData.isAdmin,
      isEditor: authData.isEditor,
      canEdit: authData.canEdit,
    },
    hasPermission: authData.hasPermission,
    refreshAuth: authData.refreshAuth,
  };
};
