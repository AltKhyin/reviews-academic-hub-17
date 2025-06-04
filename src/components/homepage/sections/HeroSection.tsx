
// ABOUTME: Hero section component for the homepage
// Displays main call-to-action and introductory content

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6 bg-white shadow-sm">
      <h1 className="text-4xl font-serif font-bold mb-4">Evidência Médica</h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Sua plataforma de referência para conteúdo médico baseado em evidências.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button 
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="font-medium"
        >
          Explorar Conteúdos
        </Button>
        <Button 
          onClick={() => navigate('/auth')}
          variant="outline"
          size="lg"
          className="font-medium"
        >
          Acessar Conta
        </Button>
      </div>
    </div>
  );
};
