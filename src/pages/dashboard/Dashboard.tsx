
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

// Define section types for rendering
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

  // Default section configuration
  const defaultSections: SectionConfig[] = [
    { id: 'reviewer', title: 'Nota do Revisor', visible: true, order: 0 },
    { id: 'featured', title: 'Destaque', visible: true, order: 1 },
    { id: 'recent', title: 'Edições Recentes', visible: true, order: 2 },
    { id: 'upcoming', title: 'Próxima Edição', visible: true, order: 3 },
    { id: 'recommended', title: 'Recomendados para você', visible: true, order: 4 },
    { id: 'trending', title: 'Mais acessados', visible: true, order: 5 },
  ];

  // State for section configuration
  const [sectionConfig, setSectionConfig] = useState<SectionConfig[]>(defaultSections);

  // Refetch issues when user data changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  // Filter out unpublished issues for non-admin/editor users
  const visibleIssues = React.useMemo(() => {
    if (!issues) return [];
    
    // Always log information about issues and profile to help with debugging
    console.log("Issues count:", issues.length, "User role:", profile?.role);
    
    const isAdminOrEditor = profile?.role === 'admin' || profile?.role === 'editor';
    
    // When profile is not yet loaded but we have issues, show all published ones
    if (!profile) {
      return issues.filter(issue => issue.published);
    }
    
    // Admin/editor see all issues, others only see published ones
    return isAdminOrEditor ? issues : issues.filter(issue => issue.published);
  }, [issues, profile]);

  const featuredIssue = visibleIssues?.find(issue => issue.featured) || visibleIssues?.[0];

  // Update section configuration from HomepageSectionsManager
  const updateSectionConfig = (newConfig: SectionConfig[]) => {
    setSectionConfig(newConfig);
  };

  // Render a section based on its type
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

  // Helper component to render article sections
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
        // For recommended, simulate by shuffling and taking first 5
        const recommended = [...filteredIssues].sort(() => Math.random() - 0.5).slice(0, 5);
        return <ArticlesSection 
          issues={recommended} 
          featuredIssueId={featuredIssueId} 
          sectionTitle={title}
          sectionType="recommended"
        />;
      case 'trending':
        // For trending, just shuffle differently
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
      {profile && (profile.role === 'admin' || profile.role === 'editor') && (
        <HomepageSectionsManager 
          sections={sectionConfig}
          updateSections={updateSectionConfig}
        />
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
            {profile?.role === 'admin' || profile?.role === 'editor' 
              ? 'Create your first article to get started.'
              : 'Check back later for new articles.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
