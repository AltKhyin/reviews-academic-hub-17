
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IssueView } from '@/types/issue';

export const useIssueViews = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Record a view for an issue
   */
  const recordIssueView = async (issueId: string) => {
    if (!issueId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if this issue has been viewed by this user/device recently
      const checkTimeWindow = new Date();
      checkTimeWindow.setHours(checkTimeWindow.getHours() - 1); // 1 hour window
      
      // For authenticated users, check by user_id
      if (user) {
        const { data: existingView } = await supabase
          .from('issue_views')
          .select('id')
          .eq('issue_id', issueId)
          .eq('user_id', user.id)
          .gt('created_at', checkTimeWindow.toISOString())
          .maybeSingle();
        
        if (existingView) {
          // Already viewed recently, don't count again
          return;
        }
        
        // Record the view with user ID - use type assertion to avoid TS errors
        await supabase
          .from('issue_views' as any)
          .insert({
            issue_id: issueId,
            user_id: user.id
          } as any);
      } else {
        // For anonymous users, just record the view
        await supabase
          .from('issue_views' as any)
          .insert({
            issue_id: issueId,
            user_id: null
          } as any);
      }
      
      // Increment the view count on the issues table
      await supabase.rpc('increment_issue_views' as any, { issue_id: issueId });
      
    } catch (err) {
      console.error('Error recording issue view:', err);
      setError(err instanceof Error ? err : new Error('Failed to record view'));
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get view count for an issue
   */
  const getIssueViewCount = async (issueId: string): Promise<number> => {
    try {
      if (!issueId) return 0;
      
      // First check if views field exists in the issues table
      const { data: issue } = await supabase
        .from('issues')
        .select('views')
        .eq('id', issueId)
        .single();
      
      if (issue && typeof issue.views === 'number') {
        return issue.views;
      }
      
      // Fallback to counting from issue_views table
      const { count, error } = await supabase
        .from('issue_views' as any)
        .select('*', { count: 'exact', head: true })
        .eq('issue_id', issueId);
      
      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('Error getting issue view count:', err);
      return 0;
    }
  };
  
  return {
    recordIssueView,
    getIssueViewCount,
    isLoading,
    error
  };
};
