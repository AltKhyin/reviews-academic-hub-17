
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewPostModal } from '@/components/community/NewPostModal';
import { PostsList } from '@/components/community/PostsList';
import { useCommunityPosts, usePostFlairs } from '@/hooks/useCommunityPosts';
import { CommunityHeader } from '@/components/community/CommunityHeader';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('latest');

  const { data: flairs } = usePostFlairs();
  const { data: posts, refetch: refetchPosts, isLoading, error } = useCommunityPosts(activeTab, searchTerm);

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
      <CommunityHeader />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Publicações</h2>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="latest">Recentes</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
          <TabsTrigger value="oldest">Mais Antigos</TabsTrigger>
          {user && <TabsTrigger value="my">Minhas Publicações</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="latest">
          <PostsList 
            posts={posts} 
            emptyMessage="Nenhuma publicação encontrada." 
            onVoteChange={refetchPosts}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="popular">
          <PostsList 
            posts={posts} 
            emptyMessage="Nenhuma publicação encontrada." 
            onVoteChange={refetchPosts}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="oldest">
          <PostsList 
            posts={posts} 
            emptyMessage="Nenhuma publicação encontrada." 
            onVoteChange={refetchPosts}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>

        {user && (
          <TabsContent value="my">
            <PostsList 
              posts={posts} 
              emptyMessage="Você ainda não criou publicações." 
              onVoteChange={refetchPosts}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>
        )}
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
