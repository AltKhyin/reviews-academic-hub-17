
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import FeaturedArticle from '@/components/dashboard/FeaturedArticle';
import ArticleRow from '@/components/dashboard/ArticleRow';
import { useSidebar } from '@/components/ui/sidebar';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === 'collapsed';

  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching issues:", error);
        return [];
      }
      return data as Issue[];
    }
  });

  // Get featured issue or fall back to most recent
  const featuredIssue = issues?.find(issue => issue.featured) || issues?.[0];
  // Get recent issues excluding the featured one
  const recentIssues = issues?.filter(issue => issue !== featuredIssue).slice(0, 5) || [];
  // Mock recommended issues (random selection)
  const recommendedIssues = issues 
    ? [...issues].sort(() => Math.random() - 0.5).slice(0, 5) 
    : [];
  // Mock most viewed issues (random selection)
  const mostViewedIssues = issues 
    ? [...issues].sort(() => Math.random() - 0.5).slice(0, 5) 
    : [];

  console.log("Current user role:", user?.role);
  
  // Transform Issue to article format
  const transformIssueToArticle = (issue: Issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    image: issue.cover_image_url || '/placeholder.svg',
    category: issue.specialty,
    date: new Date(issue.created_at).toLocaleDateString('pt-BR')
  });

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {user && (user.role === 'admin' || user.role === 'editor') && (
        <HomepageSectionsManager />
      )}
      
      {isLoading ? (
        <div>Carregando...</div>
      ) : featuredIssue ? (
        <FeaturedArticle article={transformIssueToArticle(featuredIssue)} />
      ) : null}
      
      {recentIssues.length > 0 && (
        <ArticleRow 
          title="Edições Recentes" 
          articles={recentIssues.map(transformIssueToArticle)} 
        />
      )}

      {recommendedIssues.length > 0 && (
        <ArticleRow 
          title="Recomendados para você" 
          articles={recommendedIssues.map(transformIssueToArticle)} 
        />
      )}

      {mostViewedIssues.length > 0 && (
        <ArticleRow 
          title="Mais acessados" 
          articles={mostViewedIssues.map(transformIssueToArticle)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
