
import { BaseComment, Comment, CommentWithReplies } from '@/types/commentTypes';

// This function organizes flat comments into a nested structure
export const organizeCommentsInTree = (comments: BaseComment[]): Comment[] => {
  // Use a non-recursive approach to build the tree
  const commentMap: Record<string, Comment> = {};
  const rootComments: Comment[] = [];

  // First pass: create comment objects in a map
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Second pass: organize into tree structure
  comments.forEach(comment => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      // This is a reply, add it to its parent's replies
      commentMap[comment.parent_id].replies = commentMap[comment.parent_id].replies || [];
      commentMap[comment.parent_id].replies!.push(commentMap[comment.id]);
    } else {
      // This is a root comment
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
};

// This function flattens nested comments with level information
export const flattenCommentsWithLevel = (
  comments: Comment[], 
  level = 0
): CommentWithReplies[] => {
  const result: CommentWithReplies[] = [];
  
  comments.forEach(comment => {
    const commentWithLevel: CommentWithReplies = {
      ...comment,
      replies: [],
      level
    };
    
    result.push(commentWithLevel);
    
    if (comment.replies && comment.replies.length > 0) {
      const nestedReplies = flattenCommentsWithLevel(comment.replies, level + 1);
      commentWithLevel.replies = nestedReplies;
      // Don't duplicate the children in the flattened list
      // result.push(...nestedReplies);
    }
  });
  
  return result;
};
