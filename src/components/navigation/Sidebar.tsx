
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';
import {
  Home,
  Search,
  FileText,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Archive
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: 'Início',
      icon: <Home size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/homepage',
      active: isActive('/homepage')
    },
    {
      name: 'Acervo',
      icon: <Archive size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/acervo',
      active: isActive('/acervo')
    },
    {
      name: 'Procurar',
      icon: <Search size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/search',
      active: isActive('/search'),
      adminOnly: true // Simplified: admin-only access
    },
    {
      name: 'Comunidade',
      icon: <MessageSquare size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/community',
      active: isActive('/community')
    },
    {
      name: 'Editar',
      icon: <FileText size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/edit',
      active: isActive('/edit'),
      adminOnly: true // Simplified: admin-only access
    },
    {
      name: 'Perfil',
      icon: <User size={24} strokeWidth={1.5} className="w-6 h-6" />,
      path: '/profile',
      active: isActive('/profile')
    }
  ];

  return (
    <div className={`fixed top-0 left-0 h-full z-40 bg-background border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`} style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}>
      <div className="flex flex-col h-full">
        <div className="flex justify-center items-center py-6">
          <Link to="/homepage" className="flex justify-center w-full">
            {isCollapsed ? (
              <Logo dark={false} collapsed={true} />
            ) : (
              <Logo dark={false} />
            )}
          </Link>
        </div>
        <div className="flex-grow p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              // Show admin-only items only to admins
              if (item.adminOnly && !isAdmin) {
                return null;
              }
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 font-medium tracking-wide rounded-md transition-colors ${
                      item.active 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: item.active ? '#2a2a2a' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.backgroundColor = '#2a2a2a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="flex items-center justify-center">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="ml-3 text-[0.95rem] tracking-[0.05em] font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex flex-col space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-gray-400 hover:text-white" 
              onClick={() => signOut()}
              style={{
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={24} strokeWidth={1.5} className="w-6 h-6" />
              {!isCollapsed && <span className="text-[0.95rem] tracking-[0.05em] font-medium">Sair</span>}
            </Button>
            
            <Button
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-gray-400 hover:text-white mt-2"
              onClick={toggleSidebar}
              style={{
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {!isCollapsed ? (
                <>
                  <span className="text-[0.95rem] tracking-[0.05em] font-medium">Esconder</span>
                  <ChevronLeft size={24} strokeWidth={1.5} className="w-6 h-6" />
                </>
              ) : (
                <ChevronRight size={24} strokeWidth={1.5} className="w-6 h-6 mx-auto" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
