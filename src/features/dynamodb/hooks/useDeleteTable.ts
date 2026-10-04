import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { DeleteTableInput } from '../types/dynamodb';

export function useDeleteTable() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const mutation = useMutation({
    mutationFn: async (input: DeleteTableInput) => {
      const { deleteTable } = await import('../api/dynamodb');
      return deleteTable(input, { endpoint, region: settings.region });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dynamodb', 'tables'] });
      queryClient.invalidateQueries({ queryKey: ['dynamodb', 'table', variables.tableName] });
    },
  });

  return {
    deleteTable: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}
