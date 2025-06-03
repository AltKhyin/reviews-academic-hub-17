
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
        
        {/* Centered Tabs */}
        <div className="flex justify-center mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6">
              <TabsTrigger value="latest" className="text-sm">Recentes</TabsTrigger>
              <TabsTrigger value="popular" className="text-sm">Populares</TabsTrigger>
              <TabsTrigger value="oldest" className="text-sm">Mais Antigos</TabsTrigger>
              {user && <TabsTrigger value="my" className="text-sm">Minhas Publicações</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="latest" className="mt-0">
              <PostsList 
                posts={posts} 
                emptyMessage="Nenhuma publicação encontrada." 
                onVoteChange={refetchPosts}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <PostsList 
                posts={posts} 
                emptyMessage="Nenhuma publicação encontrada." 
                onVoteChange={refetchPosts}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>

            <TabsContent value="oldest" className="mt-0">
              <PostsList 
                posts={posts} 
                emptyMessage="Nenhuma publicação encontrada." 
                onVoteChange={refetchPosts}
                isLoading={isLoading}
                error={error}
              />
            </TabsContent>

            {user && (
              <TabsContent value="my" className="mt-0">
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
