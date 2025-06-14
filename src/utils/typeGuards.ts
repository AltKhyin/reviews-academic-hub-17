
// ABOUTME: Type guards and utility functions for type safety
import { BlockType } from '@/types/review';

export const isValidBlockType = (type: string): type is BlockType => {
  const validTypes: BlockType[] = [
    'text', 'heading', 'paragraph', 'image', 'video', 'quote', 'list', 
    'code', 'table', 'divider', 'callout', 'embed', 'poll', 'chart', 
    'audio', 'file', 'gallery', 'timeline', 'comparison', 'accordion', 
    'tabs', 'figure', 'number_card', 'reviewer_quote', 'citation_list', 
    'snapshot_card', 'diagram'
  ];
  return validTypes.includes(type as BlockType);
};

export const isValidReviewType = (type: string): type is 'native' | 'pdf' | 'mixed' => {
  return ['native', 'pdf', 'mixed'].includes(type);
};

export const sanitizeBlockType = (type: any): BlockType => {
  if (typeof type === 'string' && isValidBlockType(type)) {
    return type;
  }
  return 'text'; // default fallback
};

export const sanitizeReviewType = (type: any): 'native' | 'pdf' | 'mixed' => {
  if (typeof type === 'string' && isValidReviewType(type)) {
    return type;
  }
  return 'pdf'; // default fallback
};

export const convertDatabaseIdToString = (id: number | string): string => {
  return String(id);
};

export const parseJsonSafely = <T>(json: any, fallback: T): T => {
  try {
    if (typeof json === 'string') {
      return JSON.parse(json);
    }
    return json || fallback;
  } catch {
    return fallback;
  }
};
