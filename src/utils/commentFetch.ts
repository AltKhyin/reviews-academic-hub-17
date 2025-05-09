
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
    console.log(`Fetching comments for ${entityType} with ID: ${entityId}`);
    
    // Get entity field name
    const entityField = getEntityIdField(entityType);

    // Simplify the query to avoid complex type inference issues
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:user_id(*)')
      .eq(entityField, entityId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    // Explicitly cast to BaseComment[] to avoid deep type inference
    const comments = (data || []) as unknown as BaseComment[];
    
    // Get user votes if a userId is provided
    let userVotes: CommentVote[] = [];
    if (userId && comments.length > 0) {
      // Extract comment IDs as an array of strings
      const commentIds = comments.map(c => c.id);
      
      const { data: votes, error: votesError } = await supabase
        .from('comment_votes')
        .select('user_id, comment_id, value')
        .eq('user_id', userId)
        .in('comment_id', commentIds);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
      } else if (votes) {
        userVotes = votes as CommentVote[];
      }
    }

    return { 
      comments, 
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
