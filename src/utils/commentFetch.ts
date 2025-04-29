
import { supabase } from "@/integrations/supabase/client";
import { BaseComment, CommentVote, EntityType } from '@/types/commentTypes';

// This function fetches comments for various entity types (article, issue, post)
export const fetchComments = async (
  entityType: EntityType,
  entityId: string,
  userId?: string
): Promise<{ comments: BaseComment[], userVotes: CommentVote[] }> => {
  try {
    // Get comments for the entity
    const { data: comments, error } = await supabase
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
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get user votes if a userId is provided
    let userVotes: CommentVote[] = [];
    if (userId) {
      const { data: votes, error: votesError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', userId)
        .in(
          'comment_id',
          comments.map(c => c.id)
        );

      if (!votesError && votes) {
        userVotes = votes as CommentVote[];
      }
    }

    return { comments: comments || [], userVotes };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { comments: [], userVotes: [] };
  }
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
