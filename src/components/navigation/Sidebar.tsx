
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import Logo from '../common/Logo';
import { 
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  
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

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ShadcnSidebar collapsible={collapsed ? 'icon' : 'none'} className="border-r">
      <SidebarHeader>
        <div className="p-6">
          {!collapsed ? <Logo dark size="large" /> : <div className="text-xl font-bold ml-3">R.</div>}
        </div>
      </SidebarHeader>

      <SidebarContent className="text-base font-light">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
                tooltip={item.label}
                className="h-14 text-base tracking-wide"
              >
                <Link to={item.path}>
                  <item.icon className="h-7 w-7" />
                  <span className="font-light">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="h-14 text-base tracking-wide">
              <LogOut className="h-7 w-7" />
              <span className="font-light">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={toggleSidebar} 
              className="h-14 text-base tracking-wide"
            >
              {collapsed ? (
                <>
                  <ArrowRightToLine className="h-7 w-7" />
                  <span className="font-light">Expandir</span>
                </>
              ) : (
                <>
                  <ArrowLeftToLine className="h-7 w-7" />
                  <span className="font-light">Recolher</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
