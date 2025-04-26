
import React, { useState } from 'react';
import { Search, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, collapsed }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  return (
    <header className="h-16 border-b border-[#2a2a2a] bg-[#0d0d0d] shadow-sm sticky top-0 z-10">
      <div className="h-full flex items-center justify-between px-4 max-w-full">
        <div className="flex-1" /> {/* Spacer */}
        
        {/* Right section with search and profile */}
        <div className="flex items-center gap-4">
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
          
          {/* Profile button */}
          <button className="hover:bg-[#1a1a1a] rounded-full p-2 hover-effect">
            <User size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
