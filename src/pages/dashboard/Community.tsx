import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Post } from '@/components/community/Post';
import { NewPostModal } from '@/components/community/NewPostModal';
import { useAuth } from '@/contexts/AuthContext';

interface PostFlair {
  id: string;
  name: string;
  color: string;
}

export interface PostData {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  published: boolean;
  score: number;
  poll_id: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  post_flairs: {
    id: string;
    name: string;
    color: string;
  } | null;
  poll: {
    id: string;
    options: {
      id: string;
      text: string;
      position: number;
      votes: number;
    }[];
    total_votes: number;
    user_vote: string | null;
  } | null;
}

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('latest');

  const { data: flairs } = useQuery({
    queryKey: ['flairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_flairs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PostFlair[];
    }
  });

  const { data: posts, refetch: refetchPosts } = useQuery({
    queryKey: ['community-posts', activeTab, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url),
          post_flairs:flair_id (id, name, color)
        `)
        .eq('published', true)
        .order('created_at', { ascending: activeTab === 'oldest' });
      
      // Add search filter if searchTerm is provided
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (activeTab === 'popular') {
        query = query.order('score', { ascending: false });
      }

      // For "my" tab, filter by current user
      if (activeTab === 'my' && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch poll data for posts with polls
      const postsWithPolls = await Promise.all(
        (data || []).map(async (post) => {
          if (!post.poll_id) return post;
          
          // Fetch poll options
          const { data: pollOptions } = await supabase
            .from('poll_options')
            .select('id, text, position')
            .eq('poll_id', post.poll_id)
            .order('position');
            
          // Fetch vote counts for each option
          const optionsWithVotes = await Promise.all(
            (pollOptions || []).map(async (option) => {
              const { count } = await supabase
                .from('poll_votes')
                .select('*', { count: 'exact', head: true })
                .eq('option_id', option.id);
                
              return {
                ...option,
                votes: count || 0
              };
            })
          );
          
          // Check if current user has voted
          let userVote = null;
          if (user) {
            const { data: voteData } = await supabase
              .from('poll_votes')
              .select('option_id')
              .eq('user_id', user.id)
              .in('option_id', optionsWithVotes.map(o => o.id))
              .maybeSingle();
            
            userVote = voteData?.option_id || null;
          }
          
          // Calculate total votes
          const totalVotes = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);
          
          return {
            ...post,
            poll: {
              id: post.poll_id,
              options: optionsWithVotes,
              total_votes: totalVotes,
              user_vote: userVote
            }
          };
        })
      );
      
      return postsWithPolls as PostData[];
    },
    enabled: true,
  });

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para criar uma publicação.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setIsNewPostModalOpen(true);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif">Comunidade</h1>
        <Button onClick={handleCreatePost}>Nova Publicação</Button>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar publicações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="latest">Recentes</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
          <TabsTrigger value="oldest">Mais Antigos</TabsTrigger>
          {user && <TabsTrigger value="my">Minhas Publicações</TabsTrigger>}
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          {posts?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>Nenhuma publicação encontrada.</p>
            </div>
          )}
          
          {posts?.map((post) => (
            <Post 
              key={post.id} 
              post={post} 
              onVoteChange={refetchPosts} 
            />
          ))}
        </TabsContent>
      </Tabs>
      
      {isNewPostModalOpen && (
        <NewPostModal 
          isOpen={isNewPostModalOpen} 
          onClose={() => setIsNewPostModalOpen(false)}
          onPostCreated={refetchPosts}
          flairs={flairs || []}
        />
      )}
    </div>
  );
};

export default Community;
