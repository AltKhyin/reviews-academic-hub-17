
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useSidebarData } from '@/hooks/useSidebarData';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { SidebarErrorBoundary } from './components/SidebarErrorBoundary';
import { CommunityHeader } from './components/CommunityHeader';
import { ActiveAvatars } from './components/ActiveAvatars';
import { CommentCarousel } from './components/CommentCarousel';
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

export const RightSidebar: React.FC<RightSidebarProps> = ({
  className = '',
  isMobile = false
}) => {
  const location = useLocation();
  const { isMobileDrawerOpen, toggleMobileDrawer } = useSidebarStore();
  const focusTrapRef = useFocusTrap(isMobile && isMobileDrawerOpen);
  
  // Only show sidebar in community routes
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

  // Don't render sidebar if not in community routes
  if (!shouldShowSidebar) {
    return null;
  }

  const content = (
    <SidebarErrorBoundary>
      <div 
        className="sticky top-16 max-h-[calc(100vh-theme(spacing.16))] overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
        role="complementary"
        aria-label="Barra lateral da comunidade"
      >
        <div className="p-4 space-y-6">
          <CommunityHeader />
          <ActiveAvatars />
          <CommentCarousel />
          <TopThreads />
          <NextReviewCountdown />
          <WeeklyPoll />
          <ResourceBookmarks />
          <RulesAccordion />
          <MiniChangelog />
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
        
        {/* Mobile Drawer */}
        <div 
          ref={focusTrapRef}
          className={`
            fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50
            transform transition-transform duration-300 ease-in-out
            ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-sidebar-title"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 id="mobile-sidebar-title" className="text-lg font-semibold">Comunidade</h2>
            <button
              onClick={toggleMobileDrawer}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Fechar barra lateral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
        </div>
      </>
    );
  }

  return (
    <div className={`w-80 bg-gray-900 border-l border-gray-700 ${className}`}>
      {content}
    </div>
  );
};
