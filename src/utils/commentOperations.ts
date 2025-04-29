
import { BaseComment } from '@/types/commentTypes';

// Function to find a comment by ID in a flat array
export const findCommentById = (comments: BaseComment[], id: string): BaseComment | undefined => {
  return comments.find(comment => comment.id === id);
};

// Function to create a new comment
export const createComment = async (
  content: string,
  userId: string,
  articleId?: string,
  issueId?: string,
  parentId?: string
): Promise<BaseComment> => {
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
export const updateComment = async (id: string, content: string): Promise<BaseComment> => {
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
