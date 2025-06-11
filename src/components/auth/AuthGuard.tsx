
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  requireAuth = true,
  fallbackPath = '/auth'
}) => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Verificando autenticação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    console.log("AuthGuard: User not authenticated, redirecting to auth");
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check admin requirements - simplified to admin-only
  if (requireAdmin) {
    const hasAdminAccess = isAdmin || profile?.role === 'admin';
    if (!hasAdminAccess) {
      console.log("AuthGuard: Admin access required but user doesn't have it");
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Shield className="w-5 h-5 text-red-400" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Esta página requer privilégios de administrador.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Usuário: {user?.email || 'Não autenticado'}</p>
                <p>Role: {profile?.role || 'Nenhuma'}</p>
                <p>Admin: {isAdmin ? 'Sim' : 'Não'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default AuthGuard;
