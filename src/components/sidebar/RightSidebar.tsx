
// ABOUTME: Right sidebar component with integrated scrolling and theme-aware styling
// Renders conditionally based on route and provides mobile drawer functionality

import React, { useEffect, useRef } from 'react';
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

export const RightSidebar: React.FC<RightSidebarProps> = ({
  className = '',
  isMobile = false
}) => {
  const location = useLocation();
  const { isMobileDrawerOpen, toggleMobileDrawer } = useSidebarStore();
  const focusTrapRef = useFocusTrap(isMobile && isMobileDrawerOpen);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Only show sidebar in community routes
  const shouldShowSidebar = location.pathname.startsWith('/community');
  
  // Initialize data fetching only when sidebar should be visible
  const shouldFetchData = shouldShowSidebar;
  if (shouldFetchData) {
    useSidebarData();
  }

  // Handle scroll events for scrollbar visibility
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      scrollElement.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollElement.classList.remove('scrolling');
      }, 1000);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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
        ref={scrollRef}
        className="max-h-[calc(100vh-theme(spacing.24))] overflow-y-auto community-scroll"
        role="complementary"
        aria-label="Barra lateral da comunidade"
      >
        <div className="space-y-0">
          {/* Community Header Module */}
          <div className="py-4 px-5">
            <CommunityHeader />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Active Avatars Module */}
          <div className="py-4 px-5">
            <ActiveAvatars />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Top Threads Module */}
          <div className="py-4 px-5">
            <TopThreads />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Next Review Countdown Module */}
          <div className="py-4 px-5">
            <NextReviewCountdown />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Weekly Poll Module */}
          <div className="py-4 px-5">
            <WeeklyPoll />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Resource Bookmarks Module */}
          <div className="py-4 px-5">
            <ResourceBookmarks />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Rules Accordion Module */}
          <div className="py-4 px-5">
            <RulesAccordion />
          </div>
          
          {/* Module Divider */}
          <div className="border-t border-gray-700"></div>
          
          {/* Mini Changelog Module */}
          <div className="py-4 px-5">
            <MiniChangelog />
          </div>
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
            <h2 id="mobile-sidebar-title" className="text-lg font-semibold text-white">Comunidade</h2>
            <button
              onClick={toggleMobileDrawer}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
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

  return (
    <div className={`w-full bg-transparent ${className}`}>
      {content}
    </div>
  );
};
