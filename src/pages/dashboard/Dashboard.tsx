
import React, { useEffect, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import HomepageSectionsManager from '@/components/dashboard/HomepageSectionsManager';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/hooks/useIssues';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';
import { UpcomingReleaseSection } from '@/components/dashboard/UpcomingReleaseSection';
import { ReviewerCommentSection } from '@/components/dashboard/ReviewerCommentSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SectionType = 'featured' | 'reviewer' | 'upcoming' | 'recent' | 'recommended' | 'trending';

interface SectionConfig {
  id: SectionType;
  title: string;
  visible: boolean;
  order: number;
}

const Dashboard = () => {
  const { state } = useSidebar();
  const { user, profile } = useAuth();
  const { data: issues = [], isLoading, refetch } = useIssues();
  const isCollapsed = state === 'collapsed';
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';

  const defaultSections: SectionConfig[] = [
    { id: 'reviewer', title: 'Nota do Revisor', visible: true, order: 0 },
    { id: 'featured', title: 'Destaque', visible: true, order: 1 },
    { id: 'recent', title: 'Edições Recentes', visible: true, order: 2 },
    { id: 'upcoming', title: 'Próxima Edição', visible: true, order: 3 },
    { id: 'recommended', title: 'Recomendados para você', visible: true, order: 4 },
    { id: 'trending', title: 'Mais acessados', visible: true, order: 5 },
  ];

  const [sectionConfig, setSectionConfig] = useState<SectionConfig[]>(defaultSections);

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const visibleIssues = React.useMemo(() => {
    if (!issues) return [];
    
    console.log("Issues count:", issues.length, "User role:", profile?.role);
    
    const isAdminOrEditor = profile?.role === 'admin' || profile?.role === 'editor';
    
    if (!profile) {
      return issues.filter(issue => issue.published);
    }
    
    return isAdminOrEditor ? issues : issues.filter(issue => issue.published);
  }, [issues, profile]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  const updateSectionConfig = (newConfig: SectionConfig[]) => {
    setSectionConfig(newConfig);
  };

  const renderSection = (sectionType: SectionType) => {
    if (!sectionConfig.find(s => s.id === sectionType)?.visible) {
      return null;
    }

    switch (sectionType) {
      case 'reviewer':
        return <ReviewerCommentSection />;
      case 'featured':
        return <FeaturedSection issues={visibleIssues} />;
      case 'upcoming':
        return <UpcomingReleaseSection />;
      case 'recent':
        return <ArticleRow title="Edições Recentes" section="recent" issues={visibleIssues} featuredIssueId={featuredIssue?.id} />;
      case 'recommended':
        return <ArticleRow title="Recomendados para você" section="recommended" issues={visibleIssues} featuredIssueId={featuredIssue?.id} />;
      case 'trending':
        return <ArticleRow title="Mais acessados" section="trending" issues={visibleIssues} featuredIssueId={featuredIssue?.id} />;
      default:
        return null;
    }
  };

  const ArticleRow = ({ title, section, issues, featuredIssueId }: { 
    title: string; 
    section: string; 
    issues: any[]; 
    featuredIssueId?: string;
  }) => {
    const filteredIssues = issues.filter(issue => issue.id !== featuredIssueId);
    
    if (filteredIssues.length === 0) {
      return null;
    }
    
    switch(section) {
      case 'recent':
        return <ArticlesSection 
          issues={filteredIssues.slice(0, 5)} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="recent"
        />;
      case 'recommended':
        const recommended = [...filteredIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          issues={recommended} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="recommended"
        />;
      case 'trending':
        const trending = [...filteredIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          issues={trending} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="trending"
        />;
      default:
        return null;
    }
  };

  return (
    <div className={`pt-4 pb-16 space-y-8 transition-all duration-300 ${isCollapsed ? 'max-w-full' : 'max-w-[95%] mx-auto'}`}>
      {isEditorOrAdmin && (
        <div className="mb-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="sections">Gerenciar Seções</TabsTrigger>
              <TabsTrigger value="comments">Comentários do Revisor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              {/* The main content stays here */}
            </TabsContent>
            
            <TabsContent value="sections">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Gerenciar Seções</h2>
                <HomepageSectionsManager 
                  sections={sectionConfig}
                  updateSections={updateSectionConfig}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="comments">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Comentários do Revisor</h2>
                <ReviewerCommentSection />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : visibleIssues.length > 0 ? (
        <>
          {sectionConfig
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <React.Fragment key={section.id}>
                {renderSection(section.id)}
              </React.Fragment>
            ))}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No articles available</h2>
          <p className="text-muted-foreground">
            {isEditorOrAdmin 
              ? 'Create your first article to get started.'
              : 'Check back later for new articles.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
