
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const PaymentCanceled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center text-center max-w-lg">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <X className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Pagamento cancelado</h1>
        <p className="text-muted-foreground mb-8">
          Seu pagamento foi cancelado. Se você teve algum problema durante o processo, por favor entre em contato conosco.
        </p>
        <div className="space-y-4 w-full">
          <Button className="w-full" onClick={() => navigate('/payment')}>
            Tentar novamente
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/homepage')}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled;
