
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
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
      window.location.href = '/dashboard';
    }, 1000);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-medium text-[#212121]">Bem-vindo de volta</h2>
        <p className="text-[#8E9196] mt-2">Faça login para acessar sua conta</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#212121]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 block w-full px-3 py-2 bg-white border border-[#E1E1E1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#212121] placeholder:text-[#AAADB0]"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#212121]">
              Senha
            </label>
            <Link to="/auth/forgot-password" className="text-xs text-[#212121] hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 bg-white border border-[#E1E1E1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#212121] placeholder:text-[#AAADB0]"
              placeholder="********"
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
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#212121] text-white py-2 rounded-md hover:bg-[#333333] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#212121] disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
      
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
