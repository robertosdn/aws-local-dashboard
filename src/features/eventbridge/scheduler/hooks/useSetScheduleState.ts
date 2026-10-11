import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { setScheduleState } from '../api/scheduler';
import type { SetScheduleStateInput } from '../types/scheduler';

export function useSetScheduleState(groupName: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: (input: SetScheduleStateInput) =>
      setScheduleState(input, { endpoint, region: settings.region }),
    retry: false,
    onSuccess: async (_result, input) => {
      await queryClient.invalidateQueries({
        queryKey: ['scheduler', 'schedules', endpoint, settings.region, groupName],
      });
      await queryClient.invalidateQueries({
        queryKey: [
          'scheduler',
          'schedule',
          endpoint,
          settings.region,
          groupName,
          input.scheduleName,
        ],
      });
    },
  });

  return {
    setScheduleState: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}
