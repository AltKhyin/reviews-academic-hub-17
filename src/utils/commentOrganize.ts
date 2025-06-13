
// ABOUTME: Comment organization utilities for tree structure and sorting
import { Comment } from '@/types/commentTypes';

export const organizeCommentsInTree = (comments: Comment[]): Comment[] => {
  // Create a map for quick lookup
  const commentMap = new Map<string, Comment & { replies: Comment[] }>();
  const rootComments: Comment[] = [];

  // Initialize all comments with empty replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Organize into tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id);
    if (!commentWithReplies) return;

    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  // Sort root comments by score and date
  rootComments.sort((a, b) => {
    // First sort by score (higher first)
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    // Then by creation date (newer first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Sort replies by date (older first for better conversation flow)
  const sortReplies = (comment: Comment & { replies: Comment[] }) => {
    comment.replies.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    comment.replies.forEach(sortReplies);
  };

  rootComments.forEach(sortReplies);

  return rootComments;
};
