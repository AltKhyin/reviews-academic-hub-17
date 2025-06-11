
// ABOUTME: Standardized mutation hook with comprehensive error handling and optimization
import { useMutation, useQueryClient, MutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface StandardMutationOptions<TData, TVariables> {
  mutationKey?: string[];
  invalidateQueries?: string[][];
  onSuccessMessage?: string;
  onErrorMessage?: string;
  optimisticUpdate?: {
    queryKey: string[];
    updater: (old: any, variables: TVariables) => any;
  };
}

export const useStandardizedMutation = <TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: StandardMutationOptions<TData, TVariables> = {}
) => {
  const queryClient = useQueryClient();

  const {
    mutationKey,
    invalidateQueries = [],
    onSuccessMessage,
    onErrorMessage,
    optimisticUpdate,
  } = options;

  // Handle optimistic updates
  const handleOptimisticUpdate = useCallback((variables: TVariables) => {
    if (optimisticUpdate) {
      const { queryKey, updater } = optimisticUpdate;
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => updater(old, variables));
      
      return { previousData, queryKey };
    }
    return null;
  }, [queryClient, optimisticUpdate]);

  // Revert optimistic update on error
  const revertOptimisticUpdate = useCallback((context: any) => {
    if (context?.previousData && context?.queryKey) {
      queryClient.setQueryData(context.queryKey, context.previousData);
    }
  }, [queryClient]);

  const mutation = useMutation({
    mutationKey,
    mutationFn,
    onMutate: handleOptimisticUpdate,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Show success message
      if (onSuccessMessage) {
        toast({
          title: "Sucesso",
          description: onSuccessMessage,
        });
      }
    },
    onError: (error, variables, context) => {
      console.error('Mutation error:', error);
      
      // Revert optimistic updates
      revertOptimisticUpdate(context);
      
      // Show error message
      const errorMessage = onErrorMessage || 'Ocorreu um erro inesperado.';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return mutation;
};
