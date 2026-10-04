import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { DeleteItemInput } from '../types/dynamodb';

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const mutation = useMutation({
    mutationFn: async (input: DeleteItemInput) => {
      const { deleteItem } = await import('../api/dynamodb');
      return deleteItem(input, { endpoint, region: settings.region });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dynamodb', 'query-items'] });
      queryClient.invalidateQueries({ queryKey: ['dynamodb', 'scan-items'] });
      queryClient.invalidateQueries({
        queryKey: ['dynamodb', 'table', variables.tableName],
      });
      queryClient.invalidateQueries({ queryKey: ['dynamodb', 'tables'] });
    },
  });

  return {
    deleteItem: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}
