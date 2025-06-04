
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
import { Search, Plus } from 'lucide-react';

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
      
      {/* Editorial Community Navigation Block */}
      <div className="bg-muted rounded-xl p-6 shadow-sm w-full mb-8">
        {/* Title and Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif tracking-tight">Comunidade</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discussões abertas, inteligentes e com fontes.
          </p>
        </div>
        
        {/* Actions Line: Search + New Post */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-6">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Input
              placeholder="Buscar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border px-3 py-2 rounded-md text-sm pr-10"
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
          
          <Button 
            onClick={handleCreatePost} 
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Publicação
          </Button>
        </div>
        
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 border border-border rounded-md overflow-hidden">
            <TabsTrigger value="latest" className="text-sm">Recentes</TabsTrigger>
            <TabsTrigger value="popular" className="text-sm">Populares</TabsTrigger>
            <TabsTrigger value="oldest" className="text-sm">Mais Antigos</TabsTrigger>
            {user && <TabsTrigger value="my" className="text-sm">Minhas Publi.</TabsTrigger>}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Posts Content - Full Width */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="latest" className="mt-0 w-full">
            <PostsList 
              posts={posts} 
              emptyMessage="Nenhuma publicação encontrada." 
              onVoteChange={refetchPosts}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>

          <TabsContent value="popular" className="mt-0 w-full">
            <PostsList 
              posts={posts} 
              emptyMessage="Nenhuma publicação encontrada." 
              onVoteChange={refetchPosts}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>

          <TabsContent value="oldest" className="mt-0 w-full">
            <PostsList 
              posts={posts} 
              emptyMessage="Nenhuma publicação encontrada." 
              onVoteChange={refetchPosts}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>

          {user && (
            <TabsContent value="my" className="mt-0 w-full">
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
