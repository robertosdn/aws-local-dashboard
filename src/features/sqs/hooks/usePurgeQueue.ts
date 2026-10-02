import { useMutation, useQueryClient } from '@tanstack/react-query';

import { purgeQueue } from '../api/sqs';
import { useSettings } from '@/features/settings/hooks/useSettings';

export function usePurgeQueue() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const mutation = useMutation({
    mutationFn: (queueUrl: string) => purgeQueue(queueUrl, { endpoint, region: settings.region }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sqs'] });
    },
  });

  return {
    purge: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}