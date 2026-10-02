import { useQuery, useQueryClient } from '@tanstack/react-query';

import { listQueues } from '../api/sqs';

const QUEUES_QUERY_KEY = ['sqs', 'queues'];

export function useQueues() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUEUES_QUERY_KEY,
    queryFn: listQueues,
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
  return () => queryClient.invalidateQueries({ queryKey: QUEUES_QUERY_KEY });
}