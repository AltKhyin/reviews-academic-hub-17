
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';

export const MobileSidebarToggle: React.FC = () => {
  const location = useLocation();
  const { toggleMobileDrawer } = useSidebarStore();
  
  // Only show in community routes
  const shouldShow = location.pathname.startsWith('/community');
  
  if (!shouldShow) return null;

  return (
    <button
      onClick={toggleMobileDrawer}
      className="fixed bottom-6 right-6 z-30 lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
      aria-label="Abrir barra lateral da comunidade"
    >
      <MessageSquare className="w-6 h-6" />
    </button>
  );
};
