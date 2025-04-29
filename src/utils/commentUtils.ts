
import { Comment, CommentVote, EntityType, CommentQueryResponse } from '@/types/comment';
import { supabase } from '@/integrations/supabase/client';

// Define a separate interface for comments with replies to avoid recursive type issues
export interface CommentWithReplies {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  article_id?: string | null;
  issue_id?: string | null;
  post_id?: string | null;
  parent_id?: string | null;
  score: number;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  userVote?: 1 | -1 | 0;
  replies: CommentWithReplies[];
  level: number;
}

// Helper function to determine the entity ID field based on entity type
export const getEntityIdField = (entityType: EntityType): string => {
  switch (entityType) {
    case 'article':
      return 'article_id';
    case 'issue':
      return 'issue_id';
    case 'post':
      return 'post_id';
    default:
      return 'article_id';
  }
};

// Function to fetch comments data including user votes
export const fetchCommentsData = async (entityId: string, entityType: EntityType): Promise<CommentQueryResponse> => {
  const entityIdField = getEntityIdField(entityType);
  
  // Get the current user for vote data
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch comments with profile information
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
    .eq(entityIdField, entityId)
    .order('created_at');
    
  if (commentsError) throw commentsError;
  
  // If user is logged in, fetch their votes on these comments
  let userVotes: CommentVote[] = [];
  if (user) {
    const { data: votes, error: votesError } = await supabase
      .from('comment_votes')
      .select('*')
      .eq('user_id', user.id)
      .in('comment_id', comments.map(c => c.id));
      
    if (!votesError && votes) {
      // Ensure the value is of type 1 | -1 to match CommentVote interface
      userVotes = votes.map(vote => ({
        user_id: vote.user_id,
        comment_id: vote.comment_id,
        value: vote.value === 1 ? 1 : -1 as 1 | -1
      }));
    }
  }
  
  return { comments, userVotes };
};

// Function to organize comments into a hierarchical structure
export const organizeComments = (commentsData: CommentQueryResponse): CommentWithReplies[] => {
  const { comments, userVotes } = commentsData;
  
  // Step 1: Create a map of all comments indexed by ID
  const commentMap = new Map<string, CommentWithReplies>();
  
  // First, create base objects for all comments
  comments.forEach(comment => {
    // Check if there's a user vote for this comment
    const userVote = userVotes.find(vote => vote.comment_id === comment.id)?.value || 0;
    
    commentMap.set(comment.id, {
      ...comment,
      userVote,
      replies: [],
      level: 0
    });
  });
  
  // Step 2: Build the hierarchy
  const rootComments: CommentWithReplies[] = [];
  
  // Now assign children to their parents
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parent_id) {
      // This is a reply, add it to its parent's replies array
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        commentWithReplies.level = parent.level + 1;
        parent.replies.push(commentWithReplies);
      } else {
        // If parent doesn't exist (shouldn't happen with valid data),
        // treat it as a root comment
        rootComments.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });
  
  // Sort replies by created_at for each comment
  const sortReplies = (comments: CommentWithReplies[]): void => {
    comments.forEach(comment => {
      comment.replies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      sortReplies(comment.replies);
    });
  };
  
  // Sort root comments by created_at
  rootComments.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Sort all replies recursively
  sortReplies(rootComments);
  
  return rootComments;
};

// Function to flatten a hierarchical comment structure
export const flattenComments = (organizedComments: CommentWithReplies[]): CommentWithReplies[] => {
  const flattened: CommentWithReplies[] = [];
  
  const addComment = (comment: CommentWithReplies) => {
    flattened.push(comment);
    comment.replies.forEach(reply => addComment(reply));
  };
  
  organizedComments.forEach(comment => addComment(comment));
  
  return flattened;
};

// Function to find a comment by ID in a flat array
export const findCommentById = (comments: Comment[], id: string): Comment | undefined => {
  return comments.find(comment => comment.id === id);
};

// Function to create a new comment
export const createComment = async (
  content: string,
  userId: string,
  articleId?: string,
  issueId?: string,
  parentId?: string
): Promise<Comment> => {
  // Implementation depends on your API
  return {
    id: `comment-${Date.now()}`,
    user_id: userId,
    content,
    article_id: articleId || null,
    issue_id: issueId || null,
    parent_id: parentId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    score: 0
  };
};

// Function to update a comment's content
export const updateComment = async (id: string, content: string): Promise<Comment> => {
  // Implementation depends on your API
  return {
    id,
    user_id: 'current-user',
    content,
    article_id: null,
    issue_id: null,
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    score: 0
  };
};

// Function to delete a comment
export const deleteComment = async (id: string): Promise<void> => {
  // Implementation depends on your API
  console.log(`Comment ${id} deleted`);
};

// Function to vote on a comment
export const voteComment = async (id: string, direction: 'up' | 'down'): Promise<{ success: boolean }> => {
  // Implementation depends on your API
  console.log(`Vote ${direction} for comment ${id}`);
  return { success: true };
};
