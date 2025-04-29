
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
import { Search } from 'lucide-react';

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchPosts();
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <CommunityHeader />
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <Input
              placeholder="Buscar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="ghost" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          {/* New post button */}
          <Button onClick={handleCreatePost} className="sm:ml-auto whitespace-nowrap">
            Nova Publicação
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-6 w-full sm:w-auto inline-flex">
            <TabsTrigger value="latest" className="flex-1 sm:flex-none">Recentes</TabsTrigger>
            <TabsTrigger value="popular" className="flex-1 sm:flex-none">Populares</TabsTrigger>
            <TabsTrigger value="oldest" className="flex-1 sm:flex-none">Mais Antigos</TabsTrigger>
            {user && <TabsTrigger value="my" className="flex-1 sm:flex-none">Minhas Publicações</TabsTrigger>}
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
      </div>
      
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
