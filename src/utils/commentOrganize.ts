
import { Comment, BaseComment } from '@/types/commentTypes';

/**
 * Organizes comments into a nested tree structure
 * @param comments Flat array of comments
 * @returns Array of comments with nested replies
 */
export function organizeCommentsInTree(comments: BaseComment[]): Comment[] {
  if (!comments || comments.length === 0) return [];
  
  // Create a map to store comments by id for quick lookup
  const commentMap = new Map<string, Comment>();
  
  // First pass: create Comment objects for all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [] // Initialize empty replies array
    });
  });
  
  // Second pass: organize into tree structure
  const rootComments: Comment[] = [];
  
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id);
    if (!commentWithReplies) return; // Skip if comment not found
    
    if (comment.parent_id) {
      // This is a reply, add it to its parent's replies
      const parentComment = commentMap.get(comment.parent_id);
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(commentWithReplies);
      } else {
        // If parent not found (unusual case), treat as root comment
        rootComments.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });
  
  return rootComments;
}
