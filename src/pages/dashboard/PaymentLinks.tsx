import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash, Link } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the type for payment links
interface PaymentLink {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  url: string;
  created_at: string;
  stripe_id: string;
}

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  currency: z.string().default("USD")
});

const PaymentLinks = () => {
  const { isAdmin, profile } = useAuth();
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const queryClient = useQueryClient();

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/homepage" />;
  }

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      currency: "USD"
    }
  });

  // Fetch payment links - using any type to bypass TypeScript issues with table not in types
  const { data: paymentLinks, isLoading } = useQuery({
    queryKey: ['paymentLinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_links' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Use a more explicit type casting to avoid TS2352 error
      return (data as unknown) as PaymentLink[];
    }
  });

  // Create payment link mutation
  const createPaymentLinkMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Call the edge function to create a payment link
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: { 
          name: values.name,
          description: values.description || '',
          amount: values.amount,
          currency: values.currency
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      form.reset();
      setIsCreatingLink(false);
      toast({
        title: "Success",
        description: "Payment link created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating payment link:', error);
      toast({
        title: "Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete payment link mutation
  const deletePaymentLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_links' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentLinks'] });
      toast({
        title: "Success",
        description: "Payment link deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting payment link:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment link. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPaymentLinkMutation.mutate(values);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Payment link copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Payment Links</h1>
        <Button 
          onClick={() => setIsCreatingLink(!isCreatingLink)}
          variant={isCreatingLink ? "outline" : "default"}
        >
          {isCreatingLink ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Create New Link</>}
        </Button>
      </div>

      {isCreatingLink && (
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Link</CardTitle>
            <CardDescription>Generate a new payment link that customers can use to make a purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Premium Access" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Access to premium content for one month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="29.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createPaymentLinkMutation.isPending}
                >
                  {createPaymentLinkMutation.isPending ? "Creating..." : "Create Payment Link"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Payment Links</CardTitle>
          <CardDescription>Manage your existing payment links</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
            </div>
          ) : !paymentLinks || paymentLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No payment links created yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{link.name}</div>
                        {link.description && (
                          <div className="text-sm text-gray-500">{link.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: link.currency
                      }).format(link.amount / 100)}
                    </TableCell>
                    <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyLink(link.url)}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this payment link? This action cannot be undone.")) {
                              deletePaymentLinkMutation.mutate(link.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentLinks;
