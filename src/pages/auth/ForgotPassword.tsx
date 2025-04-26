
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating API request delay
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-medium text-[#212121]">Recuperar senha</h2>
        <p className="text-[#8E9196] mt-2">Enviaremos instruções para seu email</p>
      </div>
      
      {!submitted ? (
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#212121] text-white py-2 rounded-md hover:bg-[#333333] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#212121] disabled:opacity-70"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 border border-[#E1E1E1] rounded-md bg-[#F9F9F9]">
          <p className="text-[#212121]">Instruções enviadas para:</p>
          <p className="font-medium mt-1">{email}</p>
          <p className="text-sm text-[#8E9196] mt-4">
            Verifique sua caixa de entrada e siga as instruções para recuperar sua senha.
          </p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link to="/auth/login" className="text-sm text-[#212121] hover:underline">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
