
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type AuthMode = 'login' | 'register' | 'forgot';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        await supabase.auth.signInWithPassword({
          email,
          password
        });
        navigate('/area-de-membros');
      } else if (mode === 'register') {
        await supabase.auth.signUp({
          email,
          password,
        });
        setMode('login');
        toast({
          title: "Conta criada com sucesso",
          description: "Faça login para continuar",
        });
      } else if (mode === 'forgot') {
        await supabase.auth.resetPasswordForEmail(email);
        setMode('login');
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-white to-gray-50 flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-8 flex justify-between items-center">
        {/* Left side - Logo */}
        <div className="w-1/2">
          <h1 className="font-serif text-8xl text-[#212121] tracking-tight mb-2">
            Reviews.
          </h1>
          <p className="text-gray-500 text-lg">
            - por Igor Eckert
          </p>
        </div>

        {/* Right side - Auth form */}
        <div className="w-[400px] bg-white p-8 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Cadastrar' : 'Recuperar senha'}
            </Button>

            <div className="text-center text-sm space-y-2">
              {mode === 'login' ? (
                <>
                  <p>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-blue-600 hover:underline"
                    >
                      Cadastre-se
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-gray-600 hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </p>
                </>
              ) : (
                <p>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:underline"
                  >
                    Faça login
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
