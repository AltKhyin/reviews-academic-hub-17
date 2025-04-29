
import { BaseComment, CommentQueryResponse, CommentWithReplies } from '@/types/commentTypes';

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
