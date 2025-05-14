
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookOpen, MessageSquare, Heart, Bookmark } from 'lucide-react';

interface Activity {
  id: string;
  type: 'read' | 'comment' | 'like' | 'save' | 'post';
  title: string;
  entityId: string;
  date: string;
}

interface ProfileActivityProps {
  userId?: string;
  className?: string;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({ userId, className = '' }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Artigos lidos recentemente
        const { data: viewsData, error: viewsError } = await supabase
          .from('user_article_views')
          .select('article_id, viewed_at')
          .eq('user_id', userId)
          .order('viewed_at', { ascending: false })
          .limit(5);
          
        // Comentários recentes
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('id, content, created_at, article_id, post_id, issue_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Reações recentes (likes)
        const { data: reactionsData, error: reactionsError } = await supabase
          .from('user_article_reactions')
          .select('id, article_id, reaction_type, created_at')
          .eq('user_id', userId)
          .eq('reaction_type', 'like')
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Salvamentos recentes
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('user_bookmarks')
          .select('id, article_id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Posts recentes na comunidade
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Formata os dados para exibição
        const formattedActivities: Activity[] = [];
        
        // Para simplificar, vamos usar dados de exemplo até que possamos realmente ter os títulos dos artigos
        // Num projeto real, faríamos JOIN queries para obter os títulos
        
        // Artigos lidos
        viewsData?.forEach(view => {
          formattedActivities.push({
            id: `view-${view.article_id}`,
            type: 'read',
            title: 'Artigo lido',
            entityId: view.article_id,
            date: view.viewed_at
          });
        });
        
        // Comentários
        commentsData?.forEach(comment => {
          const entityType = comment.article_id ? 'artigo' : comment.post_id ? 'post' : 'issue';
          formattedActivities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            title: `Comentário em ${entityType}`,
            entityId: comment.article_id || comment.post_id || comment.issue_id || '',
            date: comment.created_at
          });
        });
        
        // Reações
        reactionsData?.forEach(reaction => {
          formattedActivities.push({
            id: `reaction-${reaction.id}`,
            type: 'like',
            title: 'Curtiu um artigo',
            entityId: reaction.article_id,
            date: reaction.created_at
          });
        });
        
        // Salvamentos
        bookmarksData?.forEach(bookmark => {
          formattedActivities.push({
            id: `bookmark-${bookmark.id}`,
            type: 'save',
            title: 'Salvou um artigo',
            entityId: bookmark.article_id,
            date: bookmark.created_at
          });
        });
        
        // Posts
        postsData?.forEach(post => {
          formattedActivities.push({
            id: `post-${post.id}`,
            type: 'post',
            title: post.title || 'Publicou na comunidade',
            entityId: post.id,
            date: post.created_at
          });
        });
        
        // Ordena por data mais recente
        formattedActivities.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setActivities(formattedActivities);
      } catch (error) {
        console.error("Erro ao buscar atividades do usuário:", error);
        // Dados de fallback para demonstração
        setActivities([
          { id: '1', type: 'read', title: 'Artigo sobre anticoagulantes', entityId: '1', date: new Date().toISOString() },
          { id: '2', type: 'comment', title: 'Comentário em artigo sobre depressão', entityId: '2', date: new Date(Date.now() - 24*60*60*1000).toISOString() },
          { id: '3', type: 'like', title: 'Curtiu um artigo sobre cardiologia', entityId: '3', date: new Date(Date.now() - 48*60*60*1000).toISOString() },
          { id: '4', type: 'save', title: 'Salvou um artigo sobre neurologia', entityId: '4', date: new Date(Date.now() - 72*60*60*1000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);
  
  // Exibe apenas 4 atividades, ou todas se expandido
  const displayActivities = expanded ? activities : activities.slice(0, 4);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'read': return <BookOpen className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'like': return <Heart className="h-4 w-4" />;
      case 'save': return <Bookmark className="h-4 w-4" />;
      case 'post': return <MessageSquare className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'read': return 'bg-status-green';
      case 'comment': return 'bg-status-amber';
      case 'like': return 'bg-status-red';
      case 'save': return 'bg-status-purple';
      case 'post': return 'bg-status-blue';
      default: return 'bg-status-green';
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <Card className={`bg-[#1a1a1a] rounded-lg shadow-lg card-elevation ${className}`}>
      <CardHeader>
        <CardTitle className="font-serif text-xl font-medium">Atividade Recente</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse text-gray-400">Carregando atividades...</div>
          </div>
        ) : displayActivities.length > 0 ? (
          <>
            {displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-[#212121] rounded-md hover-effect">
                <div className="mt-1 flex-shrink-0">
                  <div className={`${getActivityColor(activity.type)} rounded-full p-2 flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > 4 && (
              <div className="pt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  {expanded ? 'Mostrar menos' : 'Ver mais atividades'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p>Nenhuma atividade recente encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
