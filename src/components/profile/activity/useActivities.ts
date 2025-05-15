
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from './ActivityItem';

export const useActivities = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch posts created by the user
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, title, created_at, flair_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Fetch comments made by the user
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id, 
            content, 
            created_at, 
            article_id, 
            post_id, 
            issue_id,
            posts(title, flair_id),
            articles(title),
            issues(title, specialty)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        // Fetch articles/issues the user liked
        const { data: reactionsData, error: reactionsError } = await supabase
          .from('user_article_reactions')
          .select(`
            id, 
            reaction_type,
            created_at,
            article_id, 
            issue_id,
            articles(title),
            issues(title, specialty)
          `)
          .eq('user_id', userId)
          .in('reaction_type', ['like', 'want_more'])
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Fetch bookmarked content
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('user_bookmarks')
          .select(`
            id, 
            created_at,
            article_id,
            issue_id,
            articles(title),
            issues(title, specialty)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Format the activities
        const formattedActivities: Activity[] = [];
        
        // Process posts
        if (postsData) {
          postsData.forEach(post => {
            formattedActivities.push({
              id: `post-${post.id}`,
              type: 'post',
              title: post.title || 'Publicação na comunidade',
              entityId: post.id,
              date: post.created_at
            });
          });
        }
        
        // Process comments
        if (commentsData) {
          commentsData.forEach(comment => {
            let title = 'Comentário';
            let category = '';
            const truncatedContent = comment.content 
              ? `"${comment.content.substring(0, 60)}${comment.content.length > 60 ? '...' : ''}"`
              : '';
            
            if (comment.post_id && comment.posts) {
              title = `Comentário em post de ${comment.posts.title}`;
            } else if (comment.article_id && comment.articles) {
              title = `Comentário em artigo ${comment.articles.title}`;
            } else if (comment.issue_id && comment.issues) {
              title = `Comentário em post de ${comment.issues.title}`;
              category = comment.issues.specialty || '';
            }
            
            formattedActivities.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              title,
              description: truncatedContent,
              category,
              entityId: comment.post_id || comment.article_id || comment.issue_id || '',
              date: comment.created_at
            });
          });
        }
        
        // Process reactions
        if (reactionsData) {
          reactionsData.forEach(reaction => {
            let title = '';
            let category = '';
            
            if (reaction.article_id && reaction.articles) {
              title = reaction.articles.title;
            } else if (reaction.issue_id && reaction.issues) {
              title = reaction.issues.title;
              category = reaction.issues.specialty || '';
            }
            
            if (!title) {
              return; // Skip if we don't have a title
            }
            
            formattedActivities.push({
              id: `reaction-${reaction.id}`,
              type: reaction.reaction_type === 'want_more' ? 'like' : reaction.reaction_type as any,
              title,
              category,
              entityId: reaction.article_id || reaction.issue_id || '',
              date: reaction.created_at
            });
          });
        }
        
        // Process bookmarks
        if (bookmarksData) {
          bookmarksData.forEach(bookmark => {
            let title = '';
            let category = '';
            
            if (bookmark.article_id && bookmark.articles) {
              title = bookmark.articles.title;
            } else if (bookmark.issue_id && bookmark.issues) {
              title = bookmark.issues.title;
              category = bookmark.issues.specialty || '';
            }
            
            if (!title) {
              return; // Skip if we don't have a title
            }
            
            formattedActivities.push({
              id: `bookmark-${bookmark.id}`,
              type: 'save',
              title,
              category,
              entityId: bookmark.article_id || bookmark.issue_id || '',
              date: bookmark.created_at
            });
          });
        }
        
        // Sort by date (most recent first)
        formattedActivities.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setActivities(formattedActivities);
      } catch (error) {
        console.error("Erro ao buscar atividades do usuário:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);

  return { activities, loading };
};
