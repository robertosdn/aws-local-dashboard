import { useQuery } from '@tanstack/react-query';

import { receiveMessages } from '../api/sqs';

export function useQueueMessages(queueUrl: string | null, enabled = true) {
  const query = useQuery({
    queryKey: ['sqs', 'messages', queueUrl],
    queryFn: () => receiveMessages(queueUrl!),
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