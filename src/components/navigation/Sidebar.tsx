
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Logo from '../common/Logo';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Recupera o estado da barra lateral do localStorage ao inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Salva o estado da barra lateral no localStorage ao alterar
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
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

  const navItems = [
    { icon: Home, label: 'Homepage', path: '/homepage' },
    { icon: BookOpen, label: 'Artigos', path: '/articles' },
    { icon: User, label: 'Perfil', path: '/profile' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#121212] text-white transition-all duration-300 ease-in-out border-r border-white/10 z-10 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Logo section */}
        <div className="p-5 flex justify-center">
          <Logo dark collapsed={isCollapsed} size={isCollapsed ? 'small' : 'medium'} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2.5 px-3 rounded-md mb-1 transition-colors group
                ${location.pathname === item.path ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-light tracking-wide text-sm">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer section */}
        <div className="mt-auto border-t border-white/10 py-3 px-3">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2.5 px-3 rounded-md hover:bg-white/5 transition-colors mb-3"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 font-light tracking-wide text-sm">Sair</span>}
          </button>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full py-2 px-3 rounded-md hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-3 font-light tracking-wide text-sm">Recolher</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
