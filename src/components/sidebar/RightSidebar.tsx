
// ABOUTME: Right sidebar component with unified data pipeline and proper hook usage
import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useSidebarConfig } from '@/hooks/sidebar/useSidebarConfig';
import { useOptimizedSidebarData } from '@/hooks/useOptimizedSidebarData';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { SidebarErrorBoundary } from './components/SidebarErrorBoundary';
import { CommunityHeader } from './components/CommunityHeader';
import { ActiveAvatars } from './components/ActiveAvatars';
import { TopThreads } from './components/TopThreads';
import { NextReviewCountdown } from './components/NextReviewCountdown';
import { WeeklyPoll } from './components/WeeklyPoll';
import { ResourceBookmarks } from './components/ResourceBookmarks';
import { RulesAccordion } from './components/RulesAccordion';
import { MiniChangelog } from './components/MiniChangelog';

interface RightSidebarProps {
  className?: string;
  isMobile?: boolean;
}

interface SidebarSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

const SECTION_COMPONENTS = {
  'community-header': CommunityHeader,
  'top-threads': TopThreads,
  'next-review': NextReviewCountdown,
  'weekly-poll': WeeklyPoll,
  'resource-bookmarks': ResourceBookmarks,
  'rules-accordion': RulesAccordion,
  'mini-changelog': MiniChangelog,
};

const DEFAULT_SECTIONS: SidebarSection[] = [
  { id: 'community-header', name: 'Cabeçalho da Comunidade', enabled: true, order: 0 },
  { id: 'active-avatars', name: 'Avatares Ativos', enabled: true, order: 1 },
  { id: 'top-threads', name: 'Discussões em Alta', enabled: true, order: 2 },
  { id: 'next-review', name: 'Próxima Edição', enabled: true, order: 3 },
  { id: 'weekly-poll', name: 'Enquete da Semana', enabled: true, order: 4 },
  { id: 'resource-bookmarks', name: 'Links Úteis', enabled: true, order: 5 },
  { id: 'rules-accordion', name: 'Regras da Comunidade', enabled: true, order: 6 },
  { id: 'mini-changelog', name: 'Changelog', enabled: true, order: 7 },
];

export const RightSidebar = React.memo<RightSidebarProps>(({
  className = '',
  isMobile = false
}) => {
  const location = useLocation();
  const { isMobileDrawerOpen, toggleMobileDrawer, setOnlineUsers, setStats, setComments, setThreads } = useSidebarStore();
  const focusTrapRef = useFocusTrap(isMobile && isMobileDrawerOpen);
  
  // Only show sidebar in community routes
  const shouldShowSidebar = useMemo(() => 
    location.pathname.startsWith('/community'), 
    [location.pathname]
  );
  
  // Load configuration and data with unified pipeline
  const { data: config, isLoading: configLoading } = useSidebarConfig();
  const {
    stats,
    reviewerComments,
    topThreads,
    hasError,
    isLoading: dataLoading
  } = useOptimizedSidebarData();

  // Update store with loaded data
  useEffect(() => {
    if (!dataLoading && !hasError) {
      if (stats.data) {
        setStats({
          totalUsers: stats.data.totalUsers || 0,
          onlineUsers: stats.data.onlineUsers || 0,
          totalIssues: stats.data.totalIssues || 0,
          totalPosts: stats.data.totalPosts || 0,
          totalComments: stats.data.totalComments || 0,
        });
      }
      
      if (reviewerComments.data && Array.isArray(reviewerComments.data)) {
        setComments(reviewerComments.data.map(comment => ({
          id: comment.id,
          author_name: comment.reviewer_name || 'Reviewer',
          author_avatar: comment.reviewer_avatar || null,
          body: comment.comment || '',
          votes: 0,
          created_at: comment.created_at,
          thread_id: `comment-${comment.id}`
        })));
      }
      
      if (topThreads.data && Array.isArray(topThreads.data)) {
        setThreads(topThreads.data.map(thread => ({
          id: thread.id,
          title: thread.title || 'Discussão',
          comments: Number(thread.comments) || 0,
          votes: thread.votes || 0,
          created_at: thread.created_at,
          thread_type: thread.thread_type || 'post'
        })));
      }

      // Set mock online users
      setOnlineUsers([
        { id: '1', full_name: 'Dr. Silva', avatar_url: null, last_active: new Date().toISOString() },
        { id: '2', full_name: 'Dra. Santos', avatar_url: null, last_active: new Date().toISOString() },
        { id: '3', full_name: 'Prof. Lima', avatar_url: null, last_active: new Date().toISOString() }
      ]);
    }
  }, [dataLoading, hasError, stats.data, reviewerComments.data, topThreads.data, setStats, setComments, setThreads, setOnlineUsers]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    if (!isMobile) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        toggleMobileDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isMobileDrawerOpen, toggleMobileDrawer]);

  // Get enabled sections from config or use defaults
  const enabledSections = useMemo(() => {
    if (configLoading || !config || !config.sections) {
      return DEFAULT_SECTIONS;
    }
    
    return config.sections
      .filter((section: SidebarSection) => section.enabled)
      .sort((a: SidebarSection, b: SidebarSection) => a.order - b.order);
  }, [config, configLoading]);

  // Helper function to render section components with proper props
  const renderSectionComponent = (sectionId: string) => {
    // Handle ActiveAvatars separately to pass the required users prop
    if (sectionId === 'active-avatars') {
      return <ActiveAvatars users={[
        { id: '1', full_name: 'Dr. Silva', avatar_url: null, last_active: new Date().toISOString() },
        { id: '2', full_name: 'Dra. Santos', avatar_url: null, last_active: new Date().toISOString() },
        { id: '3', full_name: 'Prof. Lima', avatar_url: null, last_active: new Date().toISOString() }
      ]} maxDisplay={8} />;
    }
    
    // Render other components from the mapping
    const SectionComponent = SECTION_COMPONENTS[sectionId as keyof typeof SECTION_COMPONENTS];
    return SectionComponent ? <SectionComponent /> : null;
  };

  // Mobile drawer overlay and sidebar
  if (isMobile) {
    return (
      <>
        {isMobileDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileDrawer}
          />
        )}
        
        <div 
          ref={focusTrapRef}
          className={`
            fixed top-0 right-0 h-full w-80 z-50 lg:hidden
            transform transition-transform duration-300 ease-in-out
            ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{ backgroundColor: '#121212' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Comunidade</h2>
            <button
              onClick={toggleMobileDrawer}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto h-full">
            <div className="space-y-6">
              {enabledSections.map((section: SidebarSection) => {
                return (
                  <SidebarErrorBoundary key={section.id} sectionId={section.id}>
                    {renderSectionComponent(section.id)}
                  </SidebarErrorBoundary>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  if (!shouldShowSidebar) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-6">
        {enabledSections.map((section: SidebarSection) => {
          return (
            <SidebarErrorBoundary key={section.id} sectionId={section.id}>
              {renderSectionComponent(section.id)}
            </SidebarErrorBoundary>
          );
        })}
      </div>
    </div>
  );
});

RightSidebar.displayName = 'RightSidebar';
