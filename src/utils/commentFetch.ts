
import { supabase } from '@/integrations/supabase/client';
import { BaseComment } from '@/types/commentTypes';
import { EntityType } from '@/types/comment';

export const getEntityIdField = (entityType: EntityType) => {
  switch (entityType) {
    case 'article': return 'article_id';
    case 'issue': return 'issue_id';
    case 'post': return 'post_id';
    default: return 'article_id';
  }
};

export const fetchCommentsData = async (entityId: string, entityType: EntityType) => {
  try {
    const entityIdField = getEntityIdField(entityType);
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id, full_name, avatar_url
        )
      `)
      .eq(entityIdField, entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], userVotes: [] };
    }

    // Fetch user votes if authenticated
    let userVotes: { user_id: string; comment_id: string; value: 1 | -1 }[] = [];
    const { data: session } = await supabase.auth.getSession();
    
    if (session?.session?.user) {
      const { data: votes, error: votesError } = await supabase
        .from('comment_votes')
        .select('user_id, comment_id, value')
        .eq('user_id', session.session.user.id);
        
      if (!votesError && votes) {
        userVotes = votes as { user_id: string; comment_id: string; value: 1 | -1 }[];
      }
    }

    return { 
      comments: comments as BaseComment[] || [], 
      userVotes 
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { comments: [], userVotes: [] };
  }
};
