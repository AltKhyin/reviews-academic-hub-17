
// ABOUTME: Comment utility functions for data transformation and validation
import { EntityType } from '@/types/commentTypes';

export const buildCommentData = (
  content: string,
  userId: string,
  entityType: EntityType,
  entityId: string,
  parentId?: string
) => {
  const baseData = {
    content: content.trim(),
    user_id: userId,
    parent_id: parentId || null,
  };

  // Add the appropriate entity ID based on type
  switch (entityType) {
    case 'issue':
      return { ...baseData, issue_id: entityId };
    case 'article':
      return { ...baseData, article_id: entityId };
    case 'post':
      return { ...baseData, post_id: entityId };
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
};

export const validateCommentContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) {
    return 'Comment content cannot be empty';
  }
  
  if (content.trim().length > 10000) {
    return 'Comment content cannot exceed 10,000 characters';
  }
  
  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// Add missing exported functions
export const processCommentsData = (comments: any[]) => {
  return comments.map(comment => ({
    ...comment,
    id: comment.id?.toString() || Math.random().toString(),
    created_at: comment.created_at || new Date().toISOString(),
  }));
};

export const getEntityIdField = (entityType: EntityType): string => {
  switch (entityType) {
    case 'issue':
      return 'issue_id';
    case 'article':
      return 'article_id';
    case 'post':
      return 'post_id';
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
};
