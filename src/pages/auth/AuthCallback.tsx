
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Handle the OAuth callback
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error during auth callback:", error);
        navigate('/auth/login');
        return;
      }
      
      if (data.session) {
        navigate('/area-de-membros');
      } else {
        navigate('/auth/login');
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse">Carregando...</div>
    </div>
  );
};

export default AuthCallback;
