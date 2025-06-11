
// ABOUTME: Standardized mutation hook with optimistic updates and consistent error handling
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useErrorTracking } from './useErrorTracking';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  invalidateQueries?: string[][];
  rollbackFn?: (variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
  component?: string;
}

export const useStandardizedMutation = <TData, TVariables>(
  config: MutationConfig<TData, TVariables>
) => {
  const queryClient = useQueryClient();
  const { trackError } = useErrorTracking();

  return useMutation({
    mutationFn: config.mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent race conditions
      if (config.invalidateQueries) {
        await Promise.all(
          config.invalidateQueries.map(key => 
            queryClient.cancelQueries({ queryKey: key })
          )
        );
      }

      // Save snapshot for potential rollback
      const previousData = config.invalidateQueries?.map(key => ({
        key,
        data: queryClient.getQueryData(key)
      }));

      // Apply optimistic update
      config.onOptimisticUpdate?.(variables);

      // Return context for rollback
      return { variables, previousData };
    },
    onError: (error, variables, context) => {
      // Track error for monitoring
      trackError(error as Error, config.component, { variables });

      // Rollback optimistic update
      if (config.rollbackFn) {
        config.rollbackFn(variables);
      } else if (context?.previousData) {
        // Automatic rollback using snapshot
        context.previousData.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
      
      // Show error toast
      toast.error(config.errorMessage || 'Operation failed. Please try again.');
      
      // Custom error handling
      config.onError?.(error as Error, variables);
    },
    onSuccess: (data, variables) => {
      if (config.successMessage) {
        toast.success(config.successMessage);
      }
      config.onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Invalidate and refetch affected queries
      if (config.invalidateQueries) {
        config.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
};
