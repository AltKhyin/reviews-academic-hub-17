
// ABOUTME: Optimized authentication hook with combined admin/editor logic and reduced database calls
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';

interface OptimizedUserData {
  id: string;
  email: string;
  role: 'user' | 'admin'; // Simplified since editor = admin
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    specialty: string | null;
    bio: string | null;
    institution: string | null;
  };
  permissions: {
    isAdmin: boolean;
    isEditor: boolean; // Will always equal isAdmin
    canEdit: boolean;
    canManageUsers: boolean;
  };
}

export const useOptimizedAuth = () => {
  const { user, session } = useAuth();

  // Single query to get all user data including permissions
  const { data: userData, isLoading, error } = useQuery({
    queryKey: queryKeys.userPermissions(user?.id),
    queryFn: async (): Promise<OptimizedUserData | null> => {
      if (!user) return null;

      try {
        // Single query to get profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, specialty, bio, institution')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Return minimal user data if profile fetch fails
          return {
            id: user.id,
            email: user.email || '',
            role: 'user',
            profile: {
              full_name: null,
              avatar_url: null,
              specialty: null,
              bio: null,
              institution: null,
            },
            permissions: {
              isAdmin: false,
              isEditor: false,
              canEdit: false,
              canManageUsers: false,
            },
          };
        }

        // Determine permissions based on role
        const isAdmin = profile.role === 'admin';
        
        return {
          id: user.id,
          email: user.email || '',
          role: profile.role as 'user' | 'admin',
          profile: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            specialty: profile.specialty,
            bio: profile.bio,
            institution: profile.institution,
          },
          permissions: {
            isAdmin,
            isEditor: isAdmin, // Since editor = admin
            canEdit: isAdmin,
            canManageUsers: isAdmin,
          },
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    },
    ...queryConfigs.profile,
    enabled: !!user && !!session,
  });

  return {
    user: userData,
    isLoading,
    error,
    // Convenience getters
    isAuthenticated: !!userData,
    isAdmin: userData?.permissions.isAdmin || false,
    isEditor: userData?.permissions.isEditor || false,
    canEdit: userData?.permissions.canEdit || false,
    canManageUsers: userData?.permissions.canManageUsers || false,
    profile: userData?.profile || null,
  };
};

// Optimized permission check hook for specific actions
export const usePermissions = () => {
  const { user } = useOptimizedAuth();
  
  return {
    canEditIssues: user?.permissions.canEdit || false,
    canManageUsers: user?.permissions.canManageUsers || false,
    canAccessAdmin: user?.permissions.isAdmin || false,
    canModerateComments: user?.permissions.isAdmin || false,
    canCreatePosts: !!user, // All authenticated users can create posts
    canVote: !!user, // All authenticated users can vote
  };
};

