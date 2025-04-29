
import { useMemo } from 'react';
import { Comment, CommentVote } from '@/types/issue';

export const useCommentOrganizer = (commentsData: { 
  comments: any[]; 
  userVotes: CommentVote[] 
} | undefined) => {
  // Organize comments into a hierarchical structure
  const organizedComments = useMemo(() => {
    if (!commentsData?.comments) return [];
    
    const { comments, userVotes } = commentsData;
    
    // Map of user votes by comment ID
    const userVotesMap: Record<string, number> = {};
    userVotes.forEach(vote => {
      userVotesMap[vote.comment_id] = vote.value;
    });
    
    // Create map for quick lookup of comments by ID
    const commentMap: Record<string, Comment> = {};
    
    // Process comments to add scores and user votes
    const processedComments = comments.map(comment => {
      const commentWithScore: Comment = {
        ...comment,
        userVote: userVotesMap[comment.id] as 1 | -1 | 0 || 0,
        replies: []
      };
      
      // Add to map for quick lookup
      commentMap[comment.id] = commentWithScore;
      
      return commentWithScore;
    });
    
    // Organize into parent-child relationship
    const topLevelComments: Comment[] = [];
    
    processedComments.forEach(comment => {
      if (!comment.parent_id) {
        // This is a top-level comment
        topLevelComments.push(comment);
      } else if (commentMap[comment.parent_id]) {
        // This is a reply to another comment
        if (!commentMap[comment.parent_id].replies) {
          commentMap[comment.parent_id].replies = [];
        }
        commentMap[comment.parent_id].replies!.push(comment);
      } else {
        // This is a reply but the parent was not found, treat as top-level
        console.warn(`Parent comment ${comment.parent_id} not found for comment ${comment.id}`);
        topLevelComments.push(comment);
      }
    });
    
    // Sort replies by created_at
    Object.values(commentMap).forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });
    
    return topLevelComments;
  }, [commentsData]);

  return organizedComments;
};
