import { useQuery } from '@tanstack/react-query';

import { getQueueDetails } from '../api/sqs';
import { useSettings } from '@/features/settings/hooks/useSettings';

export function useQueueDetails(queueUrl: string | null, enabled = true) {
  const { endpoint, settings } = useSettings();

  const query = useQuery({
    queryKey: ['sqs', 'details', endpoint, settings.region, queueUrl],
    queryFn: () => getQueueDetails(queueUrl!, { endpoint, region: settings.region }),
    enabled: enabled && !!queueUrl,
    staleTime: 30_000,
  });

  return {
    details: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
