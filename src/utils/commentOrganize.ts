
import { BaseComment, Comment, CommentWithReplies } from '@/types/commentTypes';

// This function organizes flat comments into a nested structure
export const organizeCommentsInTree = (comments: BaseComment[]): Comment[] => {
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
      if (!commentMap[comment.parent_id].replies) {
        commentMap[comment.parent_id].replies = [];
      }
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
  return comments.reduce<CommentWithReplies[]>((acc, comment) => {
    const commentWithLevel = {
      ...comment,
      replies: [],
      level
    };
    
    acc.push(commentWithLevel);
    
    if (comment.replies && comment.replies.length > 0) {
      const nestedReplies = flattenCommentsWithLevel(comment.replies, level + 1);
      commentWithLevel.replies = nestedReplies;
      acc.push(...nestedReplies);
    }
    
    return acc;
  }, []);
};

// This function organizes comments and adds user vote information
export const organizeComments = (data: { 
  comments: BaseComment[]; 
  userVotes: { user_id: string; comment_id: string; value: 1 | -1 }[] 
}): Comment[] => {
  const { comments, userVotes } = data;
  
  // First, append user votes to comments
  const commentsWithVotes = comments.map(comment => {
    const userVote = userVotes.find(vote => vote.comment_id === comment.id);
    return {
      ...comment,
      userVote: userVote ? userVote.value : 0
    };
  });
  
  // Then organize into a tree structure
  return organizeCommentsInTree(commentsWithVotes);
};
