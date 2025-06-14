
// ABOUTME: Community page with advanced caching and memoization optimizations (zero visual changes)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewPostModal } from '@/components/community/NewPostModal';
import { usePostFlairs } from '@/hooks/useCommunityPosts';
import { RightSidebar } from '@/components/sidebar/RightSidebar';
import { useOptimizedCommunityPosts } from '@/hooks/community/useOptimizedCommunityPosts';
import { useOptimizedSidebarData } from '@/hooks/sidebar/useOptimizedSidebarData';
import { Search } from 'lucide-react';
import { MemoizedPostsList, MemoizedCommunityHeader } from '@/components/community/CommunityMemoized';
import { useAPIRateLimit } from '@/hooks/useAPIRateLimit';
import { useAdvancedCaching } from '@/hooks/useAdvancedCaching';
import { usePerformanceMonitor } from '@/utils/performanceMonitor';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('latest');

  // Performance monitoring and optimization hooks
  const rateLimiter = useAPIRateLimit('community-posts', { maxRequests: 20, windowMs: 60000 });
  const cache = useAdvancedCache({ maxSize: 50, ttl: 3 * 60 * 1000 }); // 3 minutes
  const { measureAPICall, recordMetric } = usePerformanceMonitor();

  // Initialize optimized data hooks with performance monitoring
  const { data: optimizedPosts, refetch: refetchPosts, isLoading, error } = useOptimizedCommunityPosts(activeTab, searchTerm);
  const { data: sidebarData } = useOptimizedSidebarData(user?.id);
  const { data: flairs } = usePostFlairs();

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
    
    // Rate limit search requests
    if (!rateLimiter.checkRateLimit()) {
      return;
    }

    // Measure search performance
    measureAPICall('community-search', async () => {
      await refetchPosts();
      recordMetric('search-term-length', searchTerm.length, 'api');
    });
  };

  const handleTabChange = (newTab: string) => {
    // Rate limit tab changes
    if (!rateLimiter.checkRateLimit()) {
      return;
    }

    recordMetric('tab-change', 1, 'api');
    setActiveTab(newTab);
  };

  // Enhanced refetch with performance monitoring
  const enhancedRefetch = async () => {
    if (!rateLimiter.checkRateLimit()) {
      return;
    }

    await measureAPICall('community-refetch', async () => {
      await refetchPosts();
    });
  };

  // Transform optimized posts to legacy format for PostsList compatibility
  const transformedPosts = optimizedPosts?.posts.map(post => ({
    ...post,
    author: {
      full_name: post.author_name,
      avatar_url: post.author_avatar,
    },
    flair: post.flair_name ? {
      name: post.flair_name,
      color: post.flair_color,
    } : null,
    vote_value: post.user_vote,
    is_bookmarked: post.bookmark_date !== null,
    _count: {
      comments: post.comment_count,
    },
  })) || [];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      <MemoizedCommunityHeader />
      
      {/* Two-column layout: main content + integrated sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content column */}
        <div className="min-w-0">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* Search bar */}
              <form onSubmit={handleSearch} className="relative flex-1 w-full">
                <Input
                  placeholder="Buscar publicações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  style={{ backgroundColor: '#212121', borderColor: '#2a2a2a', color: '#ffffff' }}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="ghost" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  style={{ color: '#ffffff' }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              {/* New post button */}
              <Button onClick={handleCreatePost} className="sm:ml-auto whitespace-nowrap">
                Nova Publicação
              </Button>
            </div>
            
            {/* Tabs - centered but not constraining content width */}
            <div className="flex justify-center mb-6">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-2xl">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <TabsTrigger value="latest" className="text-sm">Recentes</TabsTrigger>
                  <TabsTrigger value="popular" className="text-sm">Populares</TabsTrigger>
                  <TabsTrigger value="oldest" className="text-sm">Mais Antigos</TabsTrigger>
                  {user && <TabsTrigger value="my" className="text-sm">Minhas Publicações</TabsTrigger>}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Posts content - using memoized components */}
            <div className="w-full">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsContent value="latest" className="mt-0">
                  <MemoizedPostsList 
                    posts={transformedPosts} 
                    emptyMessage="Nenhuma publicação encontrada." 
                    onVoteChange={enhancedRefetch}
                    isLoading={isLoading}
                    error={error}
                  />
                </TabsContent>

                <TabsContent value="popular" className="mt-0">
                  <MemoizedPostsList 
                    posts={transformedPosts} 
                    emptyMessage="Nenhuma publicação encontrada." 
                    onVoteChange={enhancedRefetch}
                    isLoading={isLoading}
                    error={error}
                  />
                </TabsContent>

                <TabsContent value="oldest" className="mt-0">
                  <MemoizedPostsList 
                    posts={transformedPosts} 
                    emptyMessage="Nenhuma publicação encontrada." 
                    onVoteChange={enhancedRefetch}
                    isLoading={isLoading}
                    error={error}
                  />
                </TabsContent>

                {user && (
                  <TabsContent value="my" className="mt-0">
                    <MemoizedPostsList 
                      posts={transformedPosts} 
                      emptyMessage="Você ainda não criou publicações." 
                      onVoteChange={enhancedRefetch}
                      isLoading={isLoading}
                      error={error}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>

        {/* Integrated sidebar - desktop only */}
        <div className="hidden lg:block">
          <div style={{ backgroundColor: '#121212' }} className="overflow-hidden">
            <RightSidebar isMobile={false} className="border-0 bg-transparent" />
          </div>
        </div>
      </div>
      
      {/* Mobile Right Sidebar Drawer */}
      <RightSidebar isMobile={true} />
      
      {isNewPostModalOpen && (
        <NewPostModal 
          isOpen={isNewPostModalOpen} 
          onClose={() => setIsNewPostModalOpen(false)}
          onPostCreated={enhancedRefetch}
          flairs={flairs || []}
        />
      )}
    </div>
  );
};

export default Community;
