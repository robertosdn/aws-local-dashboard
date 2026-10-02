import { useQuery } from '@tanstack/react-query';

import { receiveMessages } from '../api/sqs';
import { useSettings } from '@/features/settings/hooks/useSettings';

export function useQueueMessages(queueUrl: string | null, enabled = true) {
  const { endpoint, settings } = useSettings();
  const query = useQuery({
    queryKey: ['sqs', 'messages', endpoint, settings.region, queueUrl],
    queryFn: () => receiveMessages(queueUrl!, 10, { endpoint, region: settings.region }),
    enabled: enabled && !!queueUrl,
    staleTime: 30_000,
  });

  return {
    messages: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}