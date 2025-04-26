
import React, { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface HeaderProps {
  toggleSidebar: () => void;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = () => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você foi desconectado da sua conta',
      });
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: 'Erro ao realizar logout',
        description: 'Por favor tente novamente',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="h-16 border-b border-[#2a2a2a] bg-[#0d0d0d] shadow-sm fixed top-0 right-0 left-0 z-30">
      <div className="h-full flex items-center justify-end px-4 max-w-full">
        {/* Right section with search and logout */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Search component */}
          <div className={`relative transition-all duration-300 ease-in-out
                         ${searchExpanded ? 'w-[300px] md:w-[400px] lg:w-[500px]' : 'w-9'}`}>
            <button 
              onClick={() => setSearchExpanded(!searchExpanded)}
              className={`${searchExpanded ? 'hidden' : 'block'} hover:bg-[#1a1a1a] rounded-md p-2 hover-effect`}
              aria-label="Expand search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            
            {searchExpanded && (
              <div className="relative w-full animate-fade-in">
                <input 
                  type="text" 
                  placeholder="Buscar artigos, revisões..." 
                  className="w-full bg-[#1a1a1a] text-white rounded-md border border-[#2a2a2a] py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-white"
                  autoFocus
                />
                <Search 
                  size={18} 
                  strokeWidth={1.5} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <button
                  onClick={() => setSearchExpanded(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          
          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="hover:bg-[#1a1a1a] rounded-md p-2 hover-effect"
          >
            <LogOut size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
