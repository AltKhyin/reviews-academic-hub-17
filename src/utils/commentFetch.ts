
import { supabase } from '@/integrations/supabase/client';
import { BaseComment, Comment, CommentVote, EntityType } from '@/types/commentTypes';

/**
 * Fetches comments and user votes for a specific entity
 */
export async function fetchCommentsData(entityId: string, entityType: EntityType = 'article') {
  console.log(`Fetching comments for ${entityType} with ID: ${entityId}`);
  
  if (!entityId) {
    console.error('No entity ID provided for comment fetch');
    return { comments: [], userVotes: [] };
  }

  // Determine which field to query on based on entity type
  const idField = entityType === 'article' 
    ? 'article_id' 
    : entityType === 'post' 
      ? 'post_id' 
      : 'issue_id';
  
  try {
    // Check if the entity exists first
    const entityTable = entityType === 'article' ? 'articles' : entityType === 'post' ? 'posts' : 'issues';
    const { data: entityExists, error: entityCheckError } = await supabase
      .from(entityTable)
      .select('id')
      .eq('id', entityId)
      .maybeSingle();

    if (entityCheckError) {
      console.error(`Error checking if ${entityType} exists:`, entityCheckError);
      throw entityCheckError;
    }

    if (!entityExists) {
      console.warn(`${entityType} with ID ${entityId} does not exist`);
      return { comments: [], userVotes: [] };
    }

    // Fetch comments for this entity with profiles data included
    const { data: comments = [], error: commentError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name, 
          avatar_url
        )
      `)
      .eq(idField, entityId)
      .order('created_at', { ascending: false });

    if (commentError) {
      console.error('Error fetching comments:', commentError);
      throw commentError;
    }

    // Get the current user's ID from auth context
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // If user is authenticated, fetch their votes
    let userVotes: CommentVote[] = [];
    if (userId) {
      const { data: votes = [], error: votesError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', userId);

      if (votesError) {
        console.error('Error fetching comment votes:', votesError);
      } else {
        // Cast the values to ensure they conform to the CommentVote type
        userVotes = votes.map(vote => ({
          ...vote,
          value: vote.value === 1 ? 1 : -1 // Ensure value is strictly 1 or -1
        })) as CommentVote[];
      }
    }

    return { comments, userVotes };
  } catch (error) {
    console.error('Error in fetchCommentsData:', error);
    return { comments: [], userVotes: [] };
  }
}

/**
 * Adds user vote information to comments
 * Appends userVote property to each comment based on the user's votes
 * BUT does not modify the score - that comes from the database
 */
export function appendUserVotesToComments(
  comments: BaseComment[],
  userVotes: CommentVote[]
): BaseComment[] {
  if (!comments || comments.length === 0) {
    return [];
  }
  
  if (!userVotes || userVotes.length === 0) {
    // If there are no user votes, just return comments as is
    return comments;
  }

  // Create a map for fast lookup of user votes by comment ID
  const votesByCommentId = new Map<string, number>();
  userVotes.forEach(vote => {
    votesByCommentId.set(vote.comment_id, vote.value);
  });

  // Append userVote info to each comment WITHOUT modifying score
  return comments.map(comment => ({
    ...comment,
    userVote: votesByCommentId.has(comment.id) 
      ? (votesByCommentId.get(comment.id) as 1 | -1) 
      : 0
  }));
}
