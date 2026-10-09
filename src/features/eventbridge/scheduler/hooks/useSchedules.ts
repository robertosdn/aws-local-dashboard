import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { listSchedules } from '../api/scheduler';
import type { ScheduleState } from '../types/scheduler';

export function useSchedules(
  groupName: string | null,
  state: ScheduleState | undefined,
  nextToken?: string,
) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [
    'scheduler',
    'schedules',
    endpoint,
    settings.region,
    groupName,
    state ?? 'all',
    nextToken,
  ];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!groupName) throw new Error('No schedule group selected');
      return listSchedules(groupName, state, nextToken, { endpoint, region: settings.region });
    },
    enabled: Boolean(groupName),
    staleTime: 30_000,
  });

  return {
    schedules: query.data?.schedules ?? [],
    nextToken: query.data?.nextToken,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
