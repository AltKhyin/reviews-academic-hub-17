
// ABOUTME: Optimized comment fetching utilities with intelligent batching
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';

export const fetchCommentsData = async (entityId: string, entityType: EntityType) => {
  console.log(`Fetching comments for ${entityType} ${entityId}`);
  
  try {
    // Fetch comments with profiles in a single query to avoid N+1
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq(`${entityType}_id`, entityId)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      throw commentsError;
    }

    // Fetch user votes in a separate optimized query if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    let userVotes: Array<{ comment_id: string; value: number }> = [];
    
    if (user && comments && comments.length > 0) {
      const commentIds = comments.map(c => c.id);
      
      const { data: votes, error: votesError } = await supabase
        .from('comment_votes')
        .select('comment_id, value')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      if (votesError) {
        console.warn('Error fetching user votes:', votesError);
      } else {
        userVotes = votes || [];
      }
    }

    return {
      comments: comments || [],
      userVotes,
    };
  } catch (error) {
    console.error('Failed to fetch comments data:', error);
    throw error;
  }
};

export const appendUserVotesToComments = (
  comments: Comment[], 
  userVotes: Array<{ comment_id: string; value: number }>
): Comment[] => {
  const voteMap = new Map(userVotes.map(v => [v.comment_id, v.value]));
  
  return comments.map(comment => ({
    ...comment,
    userVote: voteMap.get(comment.id) as (1 | -1 | 0) || 0,
  }));
};
