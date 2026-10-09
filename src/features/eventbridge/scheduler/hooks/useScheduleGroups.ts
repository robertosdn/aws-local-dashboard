import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { listScheduleGroups } from '../api/scheduler';

const SCHEDULE_GROUPS_QUERY_KEY = ['scheduler', 'schedulegroups'];

export function useScheduleGroups(nextToken?: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [...SCHEDULE_GROUPS_QUERY_KEY, endpoint, settings.region, nextToken];
  const query = useQuery({
    queryKey,
    queryFn: () => listScheduleGroups(nextToken, { endpoint, region: settings.region }),
    staleTime: 30_000,
  });

  return {
    scheduleGroups: query.data?.scheduleGroups ?? [],
    nextToken: query.data?.nextToken,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
