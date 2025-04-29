
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Added missing import

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Extract the session ID from query params if available
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId) {
        setIsVerifying(true);
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId }
          });
          
          if (error) {
            console.error('Failed to verify payment:', error);
          }
          
          // You could do something with the payment verification result if needed
        } catch (err) {
          console.error('Error verifying payment:', err);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    verifyPayment();
  }, [sessionId]);

  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center text-center max-w-lg">
        <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Pagamento realizado com sucesso!</h1>
        <p className="text-muted-foreground mb-8">
          Obrigado pela sua compra. O seu pagamento foi processado com êxito.
        </p>
        <div className="space-y-4 w-full">
          <Button className="w-full" onClick={() => navigate('/homepage')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
