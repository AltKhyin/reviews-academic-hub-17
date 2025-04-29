
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const PaymentPage = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const handlePayment = async (productName: string, amount: number) => {
    try {
      setIsLoading(prev => ({ ...prev, [productName]: true }));
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          productName, 
          amount, // Amount in cents
          currency: 'usd' 
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Erro no pagamento',
        description: error instanceof Error ? error.message : 'Houve um erro ao processar o pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [productName]: false }));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-10">Planos & Preços</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Plano Básico</CardTitle>
            <CardDescription>Acesso aos recursos essenciais</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-3xl font-bold">$19.99</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Recursos básicos da plataforma</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Artigos limitados</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Suporte por email</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment('Plano Básico', 1999)}
              disabled={isLoading['Plano Básico']}
            >
              {isLoading['Plano Básico'] ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando</>
              ) : (
                'Comprar Agora'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="flex flex-col border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle>Plano Premium</CardTitle>
            <CardDescription>Nosso plano mais popular</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-3xl font-bold">$49.99</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Todos os recursos do Plano Básico</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Acesso ilimitado a artigos</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Recursos avançados</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment('Plano Premium', 4999)}
              disabled={isLoading['Plano Premium']}
            >
              {isLoading['Plano Premium'] ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando</>
              ) : (
                'Comprar Agora'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Plano Enterprise</CardTitle>
            <CardDescription>Para grandes organizações</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-3xl font-bold">$99.99</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Todos os recursos do Plano Premium</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Acesso para múltiplos usuários</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Suporte 24/7</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Recursos personalizados</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment('Plano Enterprise', 9999)}
              disabled={isLoading['Plano Enterprise']}
            >
              {isLoading['Plano Enterprise'] ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando</>
              ) : (
                'Comprar Agora'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
