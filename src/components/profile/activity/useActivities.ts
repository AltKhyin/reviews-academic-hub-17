
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from './ActivityItem';

// Lista de categorias fictícias para enriquecer os exemplos
const categories = [
  'Cardiologia', 
  'Neurologia', 
  'Pediatria', 
  'Oncologia', 
  'Psiquiatria', 
  'Dermatologia',
  'Clínica Médica'
];

// Alguns textos fictícios para enriquecer as descrições
const descriptions = {
  read: [
    'Leitura completa do artigo, com destaque para os métodos e resultados.',
    'Acesso ao texto completo com download do PDF para referência futura.',
    'Artigo revisado e compartilhado com colegas da área.',
    'Análise crítica do artigo realizada e salva como nota pessoal.'
  ],
  comment: [
    'Contribuição relevante sobre a metodologia aplicada no estudo.',
    'Questionamento sobre protocolos de tratamento mencionados no texto.',
    'Compartilhamento de experiência pessoal relacionada ao tema do artigo.',
    'Sugestão de referências complementares para o tópico em discussão.'
  ],
  like: [
    'Apreciação do conteúdo e da abordagem metodológica utilizada.',
    'Reconhecimento da relevância clínica das conclusões apresentadas.',
    'Destaque para a qualidade da revisão bibliográfica e atualidade do tema.',
    'Valorização da clareza e objetividade na apresentação dos resultados.'
  ],
  save: [
    'Conteúdo salvo para referência futura em pesquisa relacionada.',
    'Artigo adicionado à sua biblioteca pessoal para revisão posterior.',
    'Material guardado como parte de uma coletânea sobre o tema.',
    'Conteúdo destacado para ser compartilhado em grupos de estudo.'
  ],
  post: [
    'Publicação original compartilhando insights sobre prática clínica.',
    'Relato de caso interessante observado recentemente na prática.',
    'Discussão iniciada sobre novas diretrizes terapêuticas.',
    'Pesquisa original compartilhada com a comunidade para feedback.'
  ]
};

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
          // Gera título e categoria fictícios para demonstração
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomDesc = descriptions.read[Math.floor(Math.random() * descriptions.read.length)];
          
          formattedActivities.push({
            id: `view-${view.article_id}`,
            type: 'read',
            title: `Avanços em tratamentos para ${randomCategory}`,
            description: randomDesc,
            category: randomCategory,
            entityId: view.article_id,
            date: view.viewed_at
          });
        });
        
        // Comentários
        commentsData?.forEach(comment => {
          const entityType = comment.article_id ? 'artigo' : comment.post_id ? 'post' : 'issue';
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomDesc = descriptions.comment[Math.floor(Math.random() * descriptions.comment.length)];
          const truncatedContent = comment.content ? 
            comment.content.substring(0, 60) + (comment.content.length > 60 ? '...' : '') : 
            'Sem conteúdo disponível';
          
          formattedActivities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            title: `Comentário em ${entityType} de ${randomCategory}`,
            description: `"${truncatedContent}" - ${randomDesc}`,
            category: randomCategory,
            entityId: comment.article_id || comment.post_id || comment.issue_id || '',
            date: comment.created_at
          });
        });
        
        // Reações
        reactionsData?.forEach(reaction => {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomDesc = descriptions.like[Math.floor(Math.random() * descriptions.like.length)];
          
          formattedActivities.push({
            id: `reaction-${reaction.id}`,
            type: 'like',
            title: `Artigo sobre ${randomCategory}`,
            description: randomDesc,
            category: randomCategory,
            entityId: reaction.article_id,
            date: reaction.created_at
          });
        });
        
        // Salvamentos
        bookmarksData?.forEach(bookmark => {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomDesc = descriptions.save[Math.floor(Math.random() * descriptions.save.length)];
          
          formattedActivities.push({
            id: `bookmark-${bookmark.id}`,
            type: 'save',
            title: `Revisão sistemática: ${randomCategory}`,
            description: randomDesc,
            category: randomCategory,
            entityId: bookmark.article_id,
            date: bookmark.created_at
          });
        });
        
        // Posts
        postsData?.forEach(post => {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomDesc = descriptions.post[Math.floor(Math.random() * descriptions.post.length)];
          
          formattedActivities.push({
            id: `post-${post.id}`,
            type: 'post',
            title: post.title || 'Publicou na comunidade',
            description: randomDesc,
            category: randomCategory,
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
          { 
            id: '1', 
            type: 'read', 
            title: 'Artigo sobre anticoagulantes', 
            description: 'Uma análise aprofundada sobre os novos anticoagulantes e seus efeitos na prática clínica diária.',
            category: 'Cardiologia',
            entityId: '1', 
            date: new Date().toISOString() 
          },
          { 
            id: '2', 
            type: 'comment', 
            title: 'Comentário em artigo sobre depressão', 
            description: '"Excelente revisão! Gostaria de adicionar que estudos recentes também indicam..." - Contribuição sobre novas perspectivas de tratamento.',
            category: 'Psiquiatria',
            entityId: '2', 
            date: new Date(Date.now() - 24*60*60*1000).toISOString() 
          },
          { 
            id: '3', 
            type: 'like', 
            title: 'Curtiu um artigo sobre cardiologia', 
            description: 'Apreciou o conteúdo sobre os novos protocolos de tratamento para insuficiência cardíaca.',
            category: 'Cardiologia',
            entityId: '3', 
            date: new Date(Date.now() - 48*60*60*1000).toISOString() 
          },
          { 
            id: '4', 
            type: 'save', 
            title: 'Salvou um artigo sobre neurologia', 
            description: 'Adicionou à sua biblioteca pessoal um estudo recente sobre avanços no tratamento de Parkinson.',
            category: 'Neurologia',
            entityId: '4', 
            date: new Date(Date.now() - 72*60*60*1000).toISOString() 
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [userId]);

  return { activities, loading };
};
