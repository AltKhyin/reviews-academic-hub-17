
import { Comment, CommentVote } from '@/types/comment';
import { organizeComments } from '@/utils/commentUtils';

describe('commentUtils', () => {
  describe('organizeComments', () => {
    test('should return empty array for empty input', () => {
      const result = organizeComments({ comments: [], userVotes: [] });
      expect(result).toEqual([]);
    });

    test('should organize comments into hierarchical structure', () => {
      // Mock comments data
      const comments = [
        {
          id: '1',
          content: 'Parent comment 1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user_id: 'user1',
          article_id: 'article1',
          parent_id: null,
          score: 5,
          profiles: { id: 'user1', full_name: 'User One', avatar_url: null }
        },
        {
          id: '2',
          content: 'Reply to parent 1',
          created_at: '2023-01-01T01:00:00Z',
          updated_at: '2023-01-01T01:00:00Z',
          user_id: 'user2',
          article_id: 'article1',
          parent_id: '1',
          score: 3,
          profiles: { id: 'user2', full_name: 'User Two', avatar_url: null }
        },
        {
          id: '3',
          content: 'Parent comment 2',
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
          user_id: 'user3',
          article_id: 'article1',
          parent_id: null,
          score: 2,
          profiles: { id: 'user3', full_name: 'User Three', avatar_url: null }
        }
      ];

      const userVotes = [
        { user_id: 'currentUser', comment_id: '1', value: 1 },
        { user_id: 'currentUser', comment_id: '3', value: -1 }
      ];

      const result = organizeComments({ comments, userVotes });

      // Should have 2 top-level comments
      expect(result.length).toBe(2);

      // First comment should have one reply
      expect(result[0].id).toBe('1');
      expect(result[0].userVote).toBe(1);
      expect(result[0].replies?.length).toBe(1);
      expect(result[0].replies?.[0].id).toBe('2');

      // Second comment should have no replies
      expect(result[1].id).toBe('3');
      expect(result[1].userVote).toBe(-1);
      expect(result[1].replies?.length).toBe(0);
    });

    test('should handle missing parent comments', () => {
      const comments = [
        {
          id: '1',
          content: 'Parent comment',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user_id: 'user1',
          article_id: 'article1',
          parent_id: null,
          score: 5,
          profiles: { id: 'user1', full_name: 'User One', avatar_url: null }
        },
        {
          id: '2',
          content: 'Reply with missing parent',
          created_at: '2023-01-01T01:00:00Z',
          updated_at: '2023-01-01T01:00:00Z',
          user_id: 'user2',
          article_id: 'article1',
          parent_id: 'non-existent',
          score: 3,
          profiles: { id: 'user2', full_name: 'User Two', avatar_url: null }
        }
      ];

      const result = organizeComments({ comments, userVotes: [] });

      // Should have 2 top-level comments (including the one with missing parent)
      expect(result.length).toBe(2);
    });

    test('should sort replies by created_at', () => {
      const comments = [
        {
          id: '1',
          content: 'Parent comment',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user_id: 'user1',
          article_id: 'article1',
          parent_id: null,
          score: 5,
          profiles: { id: 'user1', full_name: 'User One', avatar_url: null }
        },
        {
          id: '3',
          content: 'Reply 2 (posted later)',
          created_at: '2023-01-01T03:00:00Z',
          updated_at: '2023-01-01T03:00:00Z',
          user_id: 'user3',
          article_id: 'article1',
          parent_id: '1',
          score: 1,
          profiles: { id: 'user3', full_name: 'User Three', avatar_url: null }
        },
        {
          id: '2',
          content: 'Reply 1 (posted earlier)',
          created_at: '2023-01-01T02:00:00Z',
          updated_at: '2023-01-01T02:00:00Z',
          user_id: 'user2',
          article_id: 'article1',
          parent_id: '1',
          score: 2,
          profiles: { id: 'user2', full_name: 'User Two', avatar_url: null }
        }
      ];

      const result = organizeComments({ comments, userVotes: [] });

      // Should have 1 top-level comment with 2 replies
      expect(result.length).toBe(1);
      expect(result[0].replies?.length).toBe(2);
      
      // Replies should be sorted by created_at
      expect(result[0].replies?.[0].id).toBe('2'); // Earlier post first
      expect(result[0].replies?.[1].id).toBe('3'); // Later post second
    });
  });
});
