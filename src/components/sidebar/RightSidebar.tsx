
// ABOUTME: Right sidebar component with unified configuration integration
// Now uses the new section renderer system with proper configuration support

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useSidebarData } from '@/hooks/useSidebarData';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { SidebarErrorBoundary } from './components/SidebarErrorBoundary';
import { SidebarSectionRenderer } from './SidebarSectionRenderer';

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
  const { config } = useSidebarData();
  const focusTrapRef = useFocusTrap(isMobile && isMobileDrawerOpen);
  
  // Only show sidebar in community routes
  const shouldShowSidebar = location.pathname.startsWith('/community');
  
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

  // Get enabled sections in order from configuration
  const enabledSections = config.sections
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  const content = (
    <SidebarErrorBoundary>
      <div 
        className="w-full h-full"
        role="complementary"
        aria-label="Barra lateral da comunidade"
        style={{
          fontSize: config.visual?.fontSize === 'sm' ? '0.875rem' : 
                   config.visual?.fontSize === 'lg' ? '1.125rem' : '1rem',
          backgroundColor: config.visual?.backgroundColor,
          color: config.visual?.textColor,
        }}
      >
        <div className="space-y-0">
          {enabledSections.map((section, index) => (
            <SidebarSectionRenderer
              key={section.id}
              section={section}
              isLast={index === enabledSections.length - 1}
            />
          ))}
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
            fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-700/30 z-50
            transform transition-transform duration-300 ease-in-out overflow-y-auto
            ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{ width: config.visual?.width || 320 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-sidebar-title"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
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

  // Desktop version with configuration-based styling
  return (
    <div 
      className={`w-full bg-transparent h-full overflow-y-auto ${className}`}
      style={{ 
        width: config.visual?.width || 320,
        maxWidth: config.visual?.width || 320 
      }}
    >
      {content}
    </div>
  );
};
