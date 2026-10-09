import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { getScheduleDetails } from '../api/scheduler';

export function useScheduleDetails(groupName: string | null, scheduleName: string | null) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [
    'scheduler',
    'schedule',
    endpoint,
    settings.region,
    groupName,
    scheduleName,
  ];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!groupName || !scheduleName) throw new Error('No schedule selected');
      return getScheduleDetails(groupName, scheduleName, { endpoint, region: settings.region });
    },
    enabled: Boolean(groupName && scheduleName),
    staleTime: 30_000,
  });

  return {
    scheduleDetails: query.data,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
