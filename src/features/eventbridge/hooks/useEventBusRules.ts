import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { listRules } from '../api/eventbridge';

export function useEventBusRules(eventBusName: string | null, nextToken?: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [
    'eventbridge',
    'eventbus',
    endpoint,
    settings.region,
    eventBusName,
    'rules',
    nextToken,
  ];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!eventBusName) throw new Error('No event bus selected');
      return listRules(eventBusName, nextToken, { endpoint, region: settings.region });
    },
    enabled: Boolean(eventBusName),
    staleTime: 30_000,
  });

  return {
    rules: query.data?.rules ?? [],
    nextToken: query.data?.nextToken,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
