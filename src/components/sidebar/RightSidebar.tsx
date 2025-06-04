
// ABOUTME: Right sidebar component with page-level scrolling integration
// Now uses seamless background integration with main page

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useSidebarData } from '@/hooks/useSidebarData';
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

const SECTION_COMPONENTS = {
  'community-header': CommunityHeader,
  'active-avatars': ActiveAvatars,
  'top-threads': TopThreads,
  'next-review': NextReviewCountdown,
  'weekly-poll': WeeklyPoll,
  'resource-bookmarks': ResourceBookmarks,
  'rules-accordion': RulesAccordion,
  'mini-changelog': MiniChangelog,
};

const DEFAULT_SECTIONS = [
  { id: 'community-header', name: 'Cabeçalho da Comunidade', enabled: true, order: 0 },
  { id: 'active-avatars', name: 'Avatares Ativos', enabled: true, order: 1 },
  { id: 'top-threads', name: 'Discussões em Alta', enabled: true, order: 2 },
  { id: 'next-review', name: 'Próxima Edição', enabled: true, order: 3 },
  { id: 'weekly-poll', name: 'Enquete da Semana', enabled: true, order: 4 },
  { id: 'resource-bookmarks', name: 'Links Úteis', enabled: true, order: 5 },
  { id: 'rules-accordion', name: 'Regras da Comunidade', enabled: true, order: 6 },
  { id: 'mini-changelog', name: 'Changelog', enabled: true, order: 7 },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  className = '',
  isMobile = false
}) => {
  const location = useLocation();
  const { isMobileDrawerOpen, toggleMobileDrawer, config } = useSidebarStore();
  const focusTrapRef = useFocusTrap(isMobile && isMobileDrawerOpen);
  
  // Only show sidebar in community routes (this component should only be mounted in community now)
  const shouldShowSidebar = location.pathname.startsWith('/community');
  
  // Initialize data fetching only when sidebar should be visible
  const shouldFetchData = shouldShowSidebar;
  if (shouldFetchData) {
    useSidebarData();
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

  // Don't render sidebar if not in community routes (defensive check)
  if (!shouldShowSidebar) {
    return null;
  }

  // Get enabled sections in order - use default sections if config doesn't have sections yet
  const enabledSections = (config?.sections || DEFAULT_SECTIONS)
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  const content = (
    <SidebarErrorBoundary>
      <div 
        className="w-full h-full"
        role="complementary"
        aria-label="Barra lateral da comunidade"
      >
        <div className="space-y-0">
          {enabledSections.map((section, index) => {
            const Component = SECTION_COMPONENTS[section.id as keyof typeof SECTION_COMPONENTS];
            
            if (!Component) return null;
            
            return (
              <React.Fragment key={section.id}>
                {/* Section Content */}
                <div className="py-4 px-5">
                  <Component />
                </div>
                
                {/* Module Divider - only if not last item */}
                {index < enabledSections.length - 1 && (
                  <div className="border-t border-gray-800/20"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </SidebarErrorBoundary>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Drawer Overlay */}
        {isMobileDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMobileDrawer}
            aria-hidden="true"
          />
        )}
        
        {/* Mobile Drawer - uses background to match main page */}
        <div 
          ref={focusTrapRef}
          className={`
            fixed top-0 right-0 h-full w-80 bg-background
            transform transition-transform duration-300 ease-in-out overflow-y-auto
            ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-sidebar-title"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-800/20">
            <h2 id="mobile-sidebar-title" className="text-lg font-semibold text-gray-200">Comunidade</h2>
            <button
              onClick={toggleMobileDrawer}
              className="p-2 hover:bg-gray-800/20 rounded-lg transition-colors"
              aria-label="Fechar barra lateral"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {content}
        </div>
      </>
    );
  }

  // Desktop version - seamless background integration
  return (
    <div className={`w-full bg-background h-full overflow-y-auto ${className}`}>
      {content}
    </div>
  );
};
