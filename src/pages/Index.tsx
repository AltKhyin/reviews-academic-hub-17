
// ABOUTME: Homepage/landing page with navigation sidebar integration and UserInteractionProvider
import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserInteractionProvider } from '@/contexts/UserInteractionContext';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';
import { FeaturedSection } from '@/components/dashboard/FeaturedSection';
import { ArticlesSection } from '@/components/dashboard/ArticlesSection';
import { UpcomingReleaseSection } from '@/components/dashboard/UpcomingReleaseSection';
import Logo from '@/components/common/Logo';

interface SectionConfig {
  id: string;
  component: React.ComponentType<any>;
  visible: boolean;
  order: number;
}

const Index: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { featuredIssue, recentIssues, stats, isLoading, hasError } = useOptimizedHomepage();

  // Extract issue IDs for UserInteractionProvider
  const issueIds = useMemo(() => {
    const ids: string[] = [];
    if (featuredIssue) ids.push(featuredIssue.id);
    if (recentIssues) ids.push(...recentIssues.map(issue => issue.id));
    return ids;
  }, [featuredIssue, recentIssues]);

  // Section configuration logic
  const sectionConfigs: SectionConfig[] = useMemo(() => {
    const configs: SectionConfig[] = [];
    
    // Featured section - always visible if there's a featured issue
    if (featuredIssue) {
      configs.push({
        id: 'featured',
        component: FeaturedSection,
        visible: true,
        order: 0
      });
    }
    
    // Recent articles section - visible if there are recent issues
    if (recentIssues && recentIssues.length > 0) {
      configs.push({
        id: 'articles',
        component: ArticlesSection,
        visible: true,
        order: 1
      });
    }
    
    // Upcoming releases section - always visible
    configs.push({
      id: 'upcoming',
      component: UpcomingReleaseSection,
      visible: true,
      order: 2
    });
    
    return configs.sort((a, b) => a.order - b.order);
  }, [featuredIssue, recentIssues]);

  // Content availability check
  const hasContent = useMemo(() => {
    const hasIssues = recentIssues && recentIssues.length > 0;
    const hasFeaturedIssue = Boolean(featuredIssue);
    const hasVisibleSections = sectionConfigs.some(section => section.visible);
    
    console.log('Index: Content check:', {
      hasIssues,
      hasFeaturedIssue,
      hasVisibleSections
    }, 'hasContent:', hasIssues || hasFeaturedIssue || hasVisibleSections);
    
    return hasIssues || hasFeaturedIssue || hasVisibleSections;
  }, [featuredIssue, recentIssues, sectionConfigs]);

  console.log('Index page render - Optimized data loading:', {
    issuesCount: recentIssues?.length || 0,
    featuredIssue: featuredIssue?.id || 'none',
    isLoading,
    hasErrors: hasError
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-background">
        {user && <Sidebar />}
        <div className={`flex-1 flex items-center justify-center ${user ? 'ml-64' : ''}`}>
          <div className="text-center">
            <Logo dark={false} size="large" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="flex h-screen bg-background">
        {user && <Sidebar />}
        <div className={`flex-1 flex items-center justify-center ${user ? 'ml-64' : ''}`}>
          <div className="text-center">
            <Logo dark={false} size="large" />
            <p className="mt-4 text-muted-foreground">Nenhum conteúdo disponível no momento.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Index: Rendering homepage with sections:', sectionConfigs.map(s => s.id));

  return (
    <UserInteractionProvider issueIds={issueIds}>
      <div className="flex h-screen bg-background">
        {user && <Sidebar />}
        <div className={`flex-1 overflow-auto ${user ? 'ml-64' : ''}`}>
          <main className="container mx-auto px-4 py-8">
            {!user && (
              <div className="text-center mb-8">
                <Logo dark={false} size="xlarge" />
              </div>
            )}
            
            <div className="space-y-12">
              {sectionConfigs.map((config) => {
                if (!config.visible) return null;
                
                const SectionComponent = config.component;
                return (
                  <div key={config.id}>
                    <SectionComponent 
                      featuredIssue={featuredIssue}
                      recentIssues={recentIssues}
                      stats={stats}
                    />
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </UserInteractionProvider>
  );
};

export default Index;
