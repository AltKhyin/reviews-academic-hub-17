
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut } from 'lucide-react';
import Logo from '../common/Logo';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Artigos', path: '/articles' },
    { icon: User, label: 'Perfil', path: '/profile' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <aside 
      className={`bg-[#0d0d0d] border-r border-[#2a2a2a] transition-all duration-300 ease-in-out
                 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center px-4">
          {!collapsed && <Logo dark />}
        </div>
        
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-2 py-3 text-sm hover-effect rounded-md
                              ${isActive 
                                ? 'bg-[#2a2a2a] text-white' 
                                : 'text-gray-300 hover:bg-[#1a1a1a]'}`}
                  >
                    <item.icon size={20} strokeWidth={1.5} />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-2">
          <button className="w-full flex items-center px-2 py-3 text-sm text-gray-300 hover:bg-[#1a1a1a] hover-effect rounded-md">
            <LogOut size={20} strokeWidth={1.5} />
            {!collapsed && <span className="ml-3">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
