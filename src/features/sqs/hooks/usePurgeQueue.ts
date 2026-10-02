import { useMutation, useQueryClient } from '@tanstack/react-query';

import { purgeQueue } from '../api/sqs';

export function usePurgeQueue() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: purgeQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sqs', 'queues'] });
    },
  });

  return {
    purge: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}