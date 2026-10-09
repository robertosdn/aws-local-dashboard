import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getScheduleGroupDetails } from '../api/scheduler';

export function useScheduleGroupDetails(name: string | null) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = ['scheduler', 'schedulegroup', endpoint, settings.region, name];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!name) throw new Error('No schedule group selected');
      return getScheduleGroupDetails(name, { endpoint, region: settings.region });
    },
    enabled: Boolean(name),
    staleTime: 30_000,
  });

  return {
    scheduleGroupDetails: query.data,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
