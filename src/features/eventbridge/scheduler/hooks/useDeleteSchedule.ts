import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { deleteSchedule } from '../api/scheduler';
import type { DeleteScheduleInput } from '../types/scheduler';

export function useDeleteSchedule(groupName: string) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const mutation = useMutation({
    mutationFn: (input: DeleteScheduleInput) =>
      deleteSchedule(input, { endpoint, region: settings.region }),
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
    deleteSchedule: mutation.mutateAsync,
    pending: mutation.isPending,
    error: mutation.error,
  };
}
