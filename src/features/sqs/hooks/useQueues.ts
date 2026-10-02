import { useQuery, useQueryClient } from '@tanstack/react-query';

import { listQueues } from '../api/sqs';
import { useSettings } from '@/features/settings/hooks/useSettings';

const QUEUES_QUERY_KEY = ['sqs', 'queues'];

export function useQueues() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [...QUEUES_QUERY_KEY, endpoint, settings.region];

  const query = useQuery({
    queryKey,
    queryFn: () => listQueues({ endpoint, region: settings.region }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: QUEUES_QUERY_KEY });

  return {
    queues: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch,
  };
}

export function useInvalidateQueues() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['sqs', 'queues'] });
}