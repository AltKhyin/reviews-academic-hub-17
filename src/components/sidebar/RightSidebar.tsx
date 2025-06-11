
// ABOUTME: Right sidebar component with optimized rendering and minimal re-renders
import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useSidebarData } from '@/hooks/useSidebarData';
import { useSidebarDataBridge } from '@/hooks/sidebar/useSidebarDataBridge';
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

// Remove ActiveAvatars from SECTION_COMPONENTS to fix TypeScript error
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

const isSidebarSectionsArray = (sections: unknown): sections is SidebarSection[] => {
  return Array.isArray(sections) && sections.every(section => 
    section && 
    typeof section === 'object' && 
    'id' in section && 
    'enabled' in section && 
    'order' in section
  );
};

export const RightSidebar = React.memo<RightSidebarProps>(({
  className = '',
  isMobile = false
}) => {
  const location = useLocation();
  const { isMobileDrawerOpen, toggleMobileDrawer, config, onlineUsers } = useSidebarStore();
  const focusTrapRef = useFocusTrap(isMobile && isMobileDrawerOpen);
  
  // Only show sidebar in community routes
  const shouldShowSidebar = useMemo(() => 
    location.pathname.startsWith('/community'), 
    [location.pathname]
  );
  
  // Initialize data fetching and bridge when sidebar should be visible
  const shouldFetchData = shouldShowSidebar;
  if (shouldFetchData) {
    useSidebarData();
    useSidebarDataBridge(); // Add the data bridge to connect query data to store
  }

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

  // Get enabled sections from config or use defaults with proper type checking
  const enabledSections = useMemo(() => {
    if (!config || !config.sections || !isSidebarSectionsArray(config.sections)) {
      return DEFAULT_SECTIONS;
    }
    
    return config.sections
      .filter((section: SidebarSection) => section.enabled)
      .sort((a: SidebarSection, b: SidebarSection) => a.order - b.order);
  }, [config]);

  // Helper function to render section components with proper props
  const renderSectionComponent = (sectionId: string) => {
    // Handle ActiveAvatars separately to pass the required users prop
    if (sectionId === 'active-avatars') {
      return <ActiveAvatars users={onlineUsers || []} maxDisplay={8} />;
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
