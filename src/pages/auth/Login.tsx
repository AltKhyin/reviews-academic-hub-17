
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating authentication delay
    setTimeout(() => {
      localStorage.setItem('auth_token', 'dummy-token');
      window.location.href = '/area-de-membros';
    }, 1000);
  };
  
  return (
    <div className="w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-[#212121]">
          Entrar
        </h1>
        <p className="text-[#8E9196] mt-2">
          Entre com sua conta para continuar
        </p>
      </div>
      
      <Card className="bg-white border-[#E1E1E1]">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#212121]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="border-[#E1E1E1]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#212121]">
                  Senha
                </Label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-xs text-[#212121] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="border-[#E1E1E1] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8E9196]"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.5} />
                  ) : (
                    <Eye size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#212121] hover:bg-[#333333]"
            >
              <LogIn className="mr-2" size={16} />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E1E1E1]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[#8E9196]">
                  OU CONTINUE COM
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#E1E1E1]"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-4 h-4 mr-2"
              />
              Continuar com Google
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-[#8E9196]">
          Não tem uma conta?{' '}
          <Link to="/auth/register" className="text-[#212121] hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
