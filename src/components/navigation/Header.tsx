
import React, { useState } from 'react';
import { Menu, Search, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, collapsed }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  return (
    <header className="h-16 border-b border-[#2a2a2a] bg-[#0d0d0d] shadow-sm">
      <div className="h-full flex items-center px-4">
        <button 
          onClick={toggleSidebar}
          className="hover:bg-[#1a1a1a] rounded-md p-2 hover-effect"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        
        {/* Middle section with search */}
        <div className="flex-1 flex justify-center">
          <div className={`relative transition-all duration-300 ease-in-out
                         ${searchExpanded ? 'w-full md:w-2/3' : 'w-9'}`}>
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
        </div>
        
        {/* Right section with profile */}
        <div>
          <button className="hover:bg-[#1a1a1a] rounded-full p-2 hover-effect">
            <User size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
