
import { supabase } from "@/integrations/supabase/client";
import { BaseComment, CommentVote, EntityType } from '@/types/commentTypes';
import { getEntityIdField } from './commentHelpers';

// This function fetches comments for various entity types (article, issue, post)
export const fetchComments = async (
  entityType: EntityType,
  entityId: string,
  userId?: string
): Promise<{ comments: BaseComment[], userVotes: CommentVote[] }> => {
  try {
    // Get entity field name
    const entityField = getEntityIdField(entityType);

    // Get comments for the entity with properly qualified column names
    // Use a type assertion to avoid the excessive type inference
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        article_id,
        issue_id,
        post_id,
        parent_id,
        score,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq(entityField, entityId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get user votes if a userId is provided
    let userVotes: CommentVote[] = [];
    if (userId && comments && comments.length > 0) {
      // Extract comment IDs as simple strings to avoid deep type inference
      const commentIds: string[] = comments.map((c: any) => c.id);
      
      const { data: votes, error: votesError } = await supabase
        .from('comment_votes')
        .select('user_id, comment_id, value')
        .eq('user_id', userId)
        .in('comment_id', commentIds);

      if (!votesError && votes) {
        userVotes = votes as CommentVote[];
      }
    }

    return { 
      comments: comments || [], 
      userVotes 
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { comments: [], userVotes: [] };
  }
};

// Wrapper function for fetchComments with better naming for the hook
export const fetchCommentsData = async (
  entityId: string,
  entityType: EntityType
): Promise<{ comments: BaseComment[], userVotes: CommentVote[] }> => {
  // Get current user if available
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  
  return fetchComments(entityType, entityId, userId);
};

// This function adds user vote information to comments
export const appendUserVotesToComments = (
  comments: BaseComment[],
  userVotes: CommentVote[]
): BaseComment[] => {
  if (!userVotes.length) return comments;
  
  // Create a map for faster lookup
  const votesMap: Record<string, 1 | -1> = {};
  userVotes.forEach(vote => {
    votesMap[vote.comment_id] = vote.value;
  });

  // Append vote information to each comment
  return comments.map(comment => ({
    ...comment,
    userVote: votesMap[comment.id] || 0
  }));
};
