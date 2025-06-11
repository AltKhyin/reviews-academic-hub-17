
// ABOUTME: Sidebar data management with enhanced caching and type safety
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';

export interface SidebarStats {
  totalUsers: number;
  onlineUsers: number;
  totalIssues: number;
  totalPosts: number;
  totalComments: number;
}

export const useSidebarData = () => {
  return useUnifiedQuery<SidebarStats>(
    ['sidebar-stats'],
    async (): Promise<SidebarStats> => {
      const { data, error } = await supabase.rpc('get_sidebar_stats');
      
      if (error) {
        console.error('useSidebarData: Error fetching stats:', error);
        throw error;
      }
      
      // Type guard and safe casting
      if (data && typeof data === 'object') {
        const stats = data as any;
        return {
          totalUsers: Number(stats.totalUsers) || 0,
          onlineUsers: Number(stats.onlineUsers) || 0,
          totalIssues: Number(stats.totalIssues) || 0,
          totalPosts: Number(stats.totalPosts) || 0,
          totalComments: Number(stats.totalComments) || 0,
        };
      }
      
      // Fallback defaults
      return {
        totalUsers: 0,
        onlineUsers: 0,
        totalIssues: 0,
        totalPosts: 0,
        totalComments: 0,
      };
    },
    {
      priority: 'background',
      staleTime: 5 * 60 * 1000, // 5 minutes
      enableMonitoring: false,
      rateLimit: {
        endpoint: 'sidebar',
        maxRequests: 10,
        windowMs: 60000,
      },
    }
  );
};
