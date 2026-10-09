import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { listEventBuses } from '../api/eventbridge';

const EVENT_BUSES_QUERY_KEY = ['eventbridge', 'eventbuses'];

export function useEventBuses(nextToken?: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [...EVENT_BUSES_QUERY_KEY, endpoint, settings.region, nextToken];
  const query = useQuery({
    queryKey,
    queryFn: () => listEventBuses(nextToken, { endpoint, region: settings.region }),
    staleTime: 30_000,
  });

  return {
    eventBuses: query.data?.eventBuses ?? [],
    nextToken: query.data?.nextToken,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
