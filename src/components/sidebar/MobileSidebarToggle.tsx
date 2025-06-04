
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';

export const MobileSidebarToggle: React.FC = () => {
  const location = useLocation();
  const { toggleMobileDrawer, isMobileDrawerOpen } = useSidebarStore();
  
  // Only show toggle in community routes
  const shouldShow = location.pathname.startsWith('/community');
  
  if (!shouldShow) {
    return null;
  }

  return (
    <button
      onClick={toggleMobileDrawer}
      className="fixed bottom-4 right-4 z-30 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors lg:hidden"
      aria-haspopup="dialog"
      aria-expanded={isMobileDrawerOpen}
      aria-controls="mobile-sidebar"
      aria-label="Abrir barra lateral da comunidade"
    >
      <MessageSquare className="w-6 h-6 text-white" />
    </button>
  );
};
