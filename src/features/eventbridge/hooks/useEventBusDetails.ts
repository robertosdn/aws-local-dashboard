import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getEventBusDetails } from '../api/eventbridge';

export function useEventBusDetails(name: string | null) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = ['eventbridge', 'eventbus', endpoint, settings.region, name];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!name) throw new Error('No event bus selected');
      return getEventBusDetails(name, { endpoint, region: settings.region });
    },
    enabled: Boolean(name),
    staleTime: 30_000,
  });

  return {
    eventBusDetails: query.data,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
